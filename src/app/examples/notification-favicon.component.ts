import {Component} from '@angular/core';
import {FaviconService} from '@enzedd/ng-favicon';


const EXAMPLE_TS = `
this.faviconService.setNumber(1);
this.faviconService.setDot();
this.faviconService.setDefault();
`;


@Component({
    selector: 'app-renderers',
    template: `
        <p>Click buttons below to change favicon</p>
        <p>
            <button type="button" class="btn btn-outline-primary" (click)="setHasNotificationFavicon($event)">
                Has notification
            </button>
            Click to set dot on default favicon.
        </p>
        <p>
            <button type="button" class="btn btn btn-outline-primary" (click)="incrementNotificationCount($event)">
                Notifications count
            </button>
            Click to increment notifications count.
        </p>
        <p>
            <button type="button" class="btn btn btn-outline-primary" (click)="restoreFavicon($event)">
                Restore
            </button>
            Restore default favicon
        </p>

        <!-- Usage docs -->
        <hr>
        <p>Use FaviconService to display unread messages and notifications</p>
        <div lang="typescript" [code]="exampleTs"></div>
        <p>See more in <a href="https://gitlab.com/Enzedd/ng-favicon#setnumber">documentation</a></p>
    `,
    styles: []
})
export class NotificationFaviconComponent {
    exampleTs = EXAMPLE_TS;
    messageCount = 0;

    constructor(private faviconService: FaviconService) {
    }

    setHasNotificationFavicon($event) {
        $event.preventDefault();
        this.messageCount = 0;
        this.faviconService.setDot();
    }

    incrementNotificationCount($event) {
        $event.preventDefault();
        this.messageCount++;
        this.faviconService.setNumber(this.messageCount);
    }

    restoreFavicon($event) {
        $event.preventDefault();
        this.messageCount = 0;
        this.faviconService.setDefault();
    }
}
