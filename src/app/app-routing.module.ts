import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SimpleComponent} from './examples/simple.component';
import {NotificationFaviconComponent} from './examples/notification-favicon.component';
import {CustomFaviconComponent} from './examples/custom-favicon.component';

export const PROJECT_NAME = 'ng-favicon';

export const routes: Routes = [
    {
        path: '', redirectTo: 'simple', pathMatch: 'full'
    }, {
        path: 'simple',
        component: SimpleComponent,
        data: {title: 'Example', fileName: 'examples/simple.component.ts'}
    }, {
        path: 'notification',
        component: NotificationFaviconComponent,
        data: {title: 'Favicon notifications', fileName: 'examples/notification-favicon.component.ts'}
    }, {
        path: 'custom',
        component: CustomFaviconComponent,
        data: {title: 'Custom favicon', fileName: 'examples/custom-favicon.component.ts'}
    },
];


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
