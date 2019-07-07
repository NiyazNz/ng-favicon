import {combineLatest, fromEvent, Observable} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {ColorUtils, RgbColor} from '../color.utils';
import {Icon, SizedIcons} from '../favicon.types';


const NUMBERS_SPRITE = `data:sprite/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAAAKCAYAAAA0Jkn1AAAA4UlEQVRIS+2XWxKEIAwE1/sfe
i1RqjDLMB0ftT/4ZxgeNpOAy+f3+R6hJTTVeKdLCVU91cVxYj86Xh3H6V17XI/TUz5FF8VbbILekb8GWjlKOVg5srd5rTZuZPZdrUcZhK6/6iiHlK6FQjve/
dAsWAqQ6hx4yiGly5QOteOxRlKdK1EudWltVuujGanOHFqjT3VolNru0JqgdwLDS0DG0W+lpktlWvOdc2kGxYxU81MeRTdB+1vW30A7B7p26tBsjaZnA3Xs1
fHi9z9+j3aAXWorANkfoOzhRTe+C7AJDuddAcvfXAVOlVH+AAAAAElFTkSuQmCC`;
const NO_DEFAULT_ICON = `No default favicon detected. Set at least one favicon in html document head.
Ex: <link rel="icon" type="image/png" href="assets/images/favicons/favicon.png">`;


export interface NumberRendererOptions {
    color?: string;
    bgColor?: string;
}


export class NumberRenderer {
    private numSize = 10;
    private numBgSize = 18;
    private iconSize = 32;
    color = '#ffffffff';
    bgColor = '#ff0000ff';
    contrastBorderColor = '#ffffffff';

    constructor(color?: string, bgColor?: string, contrastBorderColor?: string) {
        this.color = color || this.color;
        this.bgColor = bgColor || this.bgColor;
        this.contrastBorderColor = contrastBorderColor || this.contrastBorderColor;
    }

    private getImageLoaded(imageSrc): Observable<EventTarget> {
        const image: HTMLImageElement = new Image();
        image.src = imageSrc;
        return fromEvent(image, 'load').pipe(map((event: Event) => event.target));
    }

    private getSpiteLoaded(): Observable<EventTarget> {
        return this.getImageLoaded(NUMBERS_SPRITE);
    }

    private colorize(imageData: ImageData, color: string) {
        const c: RgbColor = ColorUtils.hexToRgba(color);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i + 3] ? c.red : data[i];
            data[i + 1] = data[i + 3] ? c.green : data[i + 1];
            data[i + 2] = data[i + 3] ? c.blue : data[i + 2];
        }
        return imageData;
    }

    public render(num: number, options: NumberRendererOptions, defaultIcons: SizedIcons): Observable<Icon[]> {
        const icon = this.getBackgroundIcon(defaultIcons);
        return combineLatest(
            this.getSpiteLoaded(),
            this.getImageLoaded(icon.href),
        ).pipe(
            take(1),
            map(([spriteImage, iconImage]: [HTMLImageElement, HTMLImageElement]) => {
                const scale = iconImage.width / this.iconSize;
                const iconContext = this.createCanvasAndGetContext(iconImage);
                iconContext.scale(scale, scale);
                // draw contrast border
                iconContext.fillStyle = options.color || this.contrastBorderColor;
                iconContext.fillRect(this.iconSize - this.numBgSize - 1, 0, this.numBgSize + 1, this.numBgSize + 1);
                // draw surrounding rectangle colored as number background
                iconContext.fillStyle = options.bgColor || this.bgColor;
                iconContext.fillRect(this.iconSize - this.numBgSize, 0, this.numBgSize, this.numBgSize);
                // draw number
                if (num > 0 && num < 10) {
                    const numbersSpriteContext = this.createCanvasAndGetContext(spriteImage);
                    const numImageData = this.getNumber(numbersSpriteContext, num, options.color || this.color);
                    const numContext = this.createCanvasAndGetContext(numImageData);
                    iconContext.drawImage(
                        numContext.canvas,
                        this.iconSize - this.numBgSize + (this.numBgSize - this.numSize) / 2,
                        (this.numBgSize - this.numSize) / 2);
                }
                return [{
                    rel: icon.rel,
                    type: icon.type,
                    sizes: icon.sizes,
                    href: iconContext.canvas.toDataURL(),
                }];
            })
        );
    }

    private getBackgroundIcon(defaultIcons: SizedIcons) {
        let icon: Icon = defaultIcons['32x32'];
        if (!icon) {
            icon = Object.values(defaultIcons)[0];
        }
        if (!icon) {
            throw Error(NO_DEFAULT_ICON);
        }
        return icon;
    }

    private getNumber(numbersSpriteContext, num: number, color?: string) {
        let numImageData = numbersSpriteContext.getImageData((num - 1) * this.numSize, 0, this.numSize, this.numSize);
        if (color) {
            numImageData = this.colorize(numImageData, color);
        }
        return numImageData;
    }

    private createCanvasAndGetContext(image?: HTMLImageElement | ImageData): CanvasRenderingContext2D {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        if (image instanceof HTMLImageElement) {
            context.drawImage(image, 0, 0);
        } else if (image instanceof ImageData) {
            context.putImageData(image as ImageData, 0, 0);
        }
        return context;
    }
}
