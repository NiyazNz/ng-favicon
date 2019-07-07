import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {FAVICON_CONFIG, FaviconModule} from '@enzedd/ng-favicon';
import {SimpleComponent} from './examples/simple.component';
import {CodeModule} from './code/code.module';
import {HeaderComponent} from './header/header.component';
import {SidenavComponent} from './sidenav/sidenav.component';
import {NotificationFaviconComponent} from './examples/notification-favicon.component';
import {CustomFaviconComponent} from './examples/custom-favicon.component';
import {FormsModule} from '@angular/forms';


@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        SidenavComponent,
        SimpleComponent,
        NotificationFaviconComponent,
        CustomFaviconComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        FaviconModule,
        CodeModule,
        AppRoutingModule,
    ],
    providers: [
        {
            provide: FAVICON_CONFIG,
            useValue: {
                color: '#fff',
                bgColor: '#00f',
                icons: {
                    dotted: {
                        rel: 'icon',
                        type: 'image/png',
                        sizes: '32x32',
                        href: 'assets/images/favicons/favicon-dotted-32x32.png'
                    },
                },
            },
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
