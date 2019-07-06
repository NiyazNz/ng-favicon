import {fromEvent, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Icon, IconMap} from '../favicon.types';


const NO_DEFAULT_ICON = `No default favicon detected. Set at least one favicon in html document head.
Ex: <link rel="icon" type="image/png" href="assets/images/favicons/favicon.png">`;


export interface DotRendererOptions {
    color?: string;
    centerX?: number;
    centerY?: number;
    radius?: number;
}


export class DotRenderer {
    public static renderRightTop(options: DotRendererOptions, defaultIcons: IconMap): Observable<Icon[]> {
        options = Object.assign({}, options, {centerX: 0.7, centerY: 0.25});
        return DotRenderer.render(options, defaultIcons);
    }

    public static renderRightBottom(options: DotRendererOptions, defaultIcons: IconMap): Observable<Icon[]> {
        options = Object.assign({}, options, {centerX: 0.7, centerY: 0.75});
        return DotRenderer.render(options, defaultIcons);
    }

    public static render(options: DotRendererOptions, defaultIcons: IconMap): Observable<Icon[]> {
        let icon: Icon = defaultIcons['32x32'];
        if (!icon) {
            icon = Object.values(defaultIcons)[0];
        }
        if (!icon) {
            throw Error(NO_DEFAULT_ICON);
        }
        const img: HTMLImageElement = new Image();
        img.src = icon.href;
        return fromEvent(img, 'load').pipe(
            map((event: Event) => event.target),
            map((image: HTMLImageElement) => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0);

                const radius = context.canvas.width * (options.radius || 0.25);
                const centerX = context.canvas.width * (options.centerX || 0.7);
                const centerY = context.canvas.height * (options.centerY || 0.25);

                context.fillStyle = options.color || '#f00';
                context.beginPath();
                context.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
                context.closePath();
                context.fill();
                return [{
                    rel: icon.rel,
                    type: icon.type,
                    sizes: icon.sizes,
                    href: canvas.toDataURL(),
                }];
            })
        );
    }
}
