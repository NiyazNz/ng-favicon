import {fromEvent, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {HexColor} from '../utils';
import {Icon, IconMap} from '../types';


export interface DotRendererOptions {
    color?: HexColor;
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
        const icon: Icon = Object.values(defaultIcons)[0];
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
