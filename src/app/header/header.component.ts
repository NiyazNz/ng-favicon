import {Component, Input} from '@angular/core';


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
})
export class HeaderComponent {
    @Input() packageName: string;
    @Input() repository: string;
    @Input() npmUrl: string;

    constructor() {
    }

}
