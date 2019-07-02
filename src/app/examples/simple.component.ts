import {Component} from '@angular/core';
import {FaviconService} from '@enzedd/ng-favicon';


const EXAMPLE_TS = `
this.faviconService.set('dotted');
this.faviconService.setDefault();
`;


@Component({
    selector: 'app-simple',
    template: `
        <p>Click buttons below to change favicon</p>
        <p>
            <button type="button" class="btn btn-outline-primary" (click)="setFavicon($event)">
                Dotted favicon
            </button>
            Click to set preconfigured dotted favicon.
        </p>
        <p>
            <button type="button" class="btn btn btn-outline-primary" (click)="restoreFavicon($event)">
                Restore
            </button>
            Restore default favicon
        </p>

        <!-- Usage docs -->
        <hr>
        <p>Use FaviconService to set preconfigured icons by name</p>
        <div lang="typescript" [code]="exampleTs"></div>
        <p>See more in <a href="https://gitlab.com/Enzedd/ng-favicon#set">configuration</a> section of documentation
        </p>
    `,
    styles: []
})
export class SimpleComponent {
    exampleTs = EXAMPLE_TS;

    constructor(private faviconService: FaviconService) {
    }

    setFavicon($event) {
        $event.preventDefault();
        this.faviconService.set('dotted');
    }

    restoreFavicon($event) {
        $event.preventDefault();
        this.faviconService.setDefault();
    }

}
