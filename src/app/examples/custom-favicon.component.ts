import {Component} from '@angular/core';
import {fromEvent, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {FaviconService, Icon, IconMap} from '@enzedd/ng-favicon';


const EXAMPLE_TS1 = `this.faviconService.setCustom(customGetIconFn, options);`;
const EXAMPLE_TS2 = `
function customGetIconFn(options, defaultIcons?: IconMap): Observable<Icon[]> {
    ...
}
`;


@Component({
    selector: 'app-custom-icon',
    template: `
        <p>Click buttons below to change favicon</p>
        <p>
            <button type="button" class="btn btn-outline-primary" (click)="setCustomFavicon1($event)">
                Custom GetIconFn
            </button>
        </p>
        <p>
            <button type="button" class="btn btn-outline-primary" (click)="setCustomFavicon2($event)">
                Custom renderer
            </button>
        </p>
        <p>
            <button type="button" class="btn btn btn-outline-primary" (click)="restoreFavicon($event)">
                Restore
            </button>
            Restore default favicon
        </p>

        <!-- Usage docs -->
        <hr>
        <p>Use FaviconService with custom GetIconFn function to get or generate your favicons:</p>
        <div lang="typescript" [code]="exampleTs1"></div>
        <div lang="typescript" [code]="exampleTs2"></div>
        <p>See more in <a href="https://gitlab.com/Enzedd/ng-favicon#setCustom()">documentation</a></p>
    `,
    styles: []
})
export class CustomFaviconComponent {
    exampleTs1 = EXAMPLE_TS1;
    exampleTs2 = EXAMPLE_TS2;

    constructor(private faviconService: FaviconService) {
    }

    setCustomFavicon1($event) {
        function getIcon(options, defaultIcons?: IconMap): Observable<Icon[]> {
            const icon: Icon = Object.values(defaultIcons)[0];
            const url = icon.href.slice(0, icon.href.length - 9) + 'dotted' + icon.href.slice(icon.href.length - 10, icon.href.length);
            return of([{
                rel: icon.rel, type: icon.type, sizes: icon.sizes,
                href: url,
            }]);
        }

        $event.preventDefault();
        this.faviconService.setCustom(getIcon);
    }

    setCustomFavicon2($event) {
        function dotRenderer(options, defaultIcons?: IconMap): Observable<Icon[]> {
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
                    context.fillStyle = '#0f0';
                    context.beginPath();
                    context.arc(context.canvas.width * 0.7, context.canvas.height * 0.75,
                        context.canvas.width * 0.25, 0, Math.PI * 2);
                    context.closePath();
                    context.fill();
                    return [{
                        rel: icon.rel, type: icon.type, sizes: icon.sizes,
                        href: canvas.toDataURL(),
                    }];
                })
            );
        }

        $event.preventDefault();
        this.faviconService.setCustom(dotRenderer);
    }

    restoreFavicon($event) {
        $event.preventDefault();
        this.faviconService.setDefault();
    }
}
