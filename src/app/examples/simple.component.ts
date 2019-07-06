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
            <button type="button" class="btn btn-outline-primary" (click)="setByName($event)">
                Set favicon
            </button>
            Click to set preconfigured dotted favicon.
        </p>
        <div class="input-group mb-3">
            <div class="input-group-prepend">
                <button type="button" class="btn btn-outline-primary" (click)="setFavicon($event)">
                    Set this favicon
                </button>
            </div>
            <input type="text" class="form-control" placeholder="Set your favicon" [(ngModel)]="icon">
        </div>
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
    icon = 'https://abs.twimg.com/favicons/favicon.ico';

    constructor(private faviconService: FaviconService) {
    }

    setByName($event) {
        $event.preventDefault();
        this.faviconService.set('dotted');
    }

    setFavicon($event) {
        $event.preventDefault();
        this.faviconService.setIcon(this.icon);
    }

    restoreFavicon($event) {
        $event.preventDefault();
        this.faviconService.setDefault();
    }

}
