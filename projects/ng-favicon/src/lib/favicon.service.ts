import {Inject, Injectable, InjectionToken, Optional} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {noop} from 'rxjs';


export interface Icon {
    rel?: string;
    type?: string;
    sizes?: string;
    href: string;
}


export type IconSet = Icon[];


export interface FaviconConfig {
    [name: string]: Icon | Icon[];
}


const DEFAULT_ICON_KEY = '__default';
const ICON_RELS = [
    'icon',
    'apple-touch-icon',
    'apple-touch-icon-precomposed',
    'mask-icon',
];


export const FAVICON_CONFIG = new InjectionToken<FaviconConfig>('Favicon Configuration');


@Injectable({
    providedIn: 'root'
})
export class FaviconService {
    private head: HTMLHeadElement;
    private _current: string = DEFAULT_ICON_KEY;

    get current(): string {
        return this._current;
    }

    constructor(
        @Inject(DOCUMENT) private document,
        @Optional() @Inject(FAVICON_CONFIG) private appIcons: FaviconConfig
    ) {
        this.document = document as Document;
        this.head = document.head;
        this.appIcons = Object.assign({}, appIcons) as FaviconConfig;
    }

    public setDefault() {
        this.set(DEFAULT_ICON_KEY);
    }

    public set(name?: string) {
        if (!this.appIcons[DEFAULT_ICON_KEY]) {
            this.backupDefaultIcons();
        }
        name = name || DEFAULT_ICON_KEY;
        if (name === this._current) {
            return;
        }
        this._current = name;
        if (this.appIcons[name]) {
            const iconSet: IconSet = ((this.appIcons[name] instanceof Array) ? this.appIcons[name] : [this.appIcons[name]]) as IconSet;
            if (iconSet.length) {
                this.removeIcons();
                this.setIcons(iconSet);
            }
        }
    }

    private getSelector(icon: Icon): string {
        let selector = 'link';
        selector += icon.rel ? `[rel="${icon.rel}"]` : '[rel]';
        selector += icon.type ? `[type="${icon.type}"]` : '';
        selector += icon.sizes ? `[sizes="${icon.sizes}"]` : '';
        return selector;
    }

    private getAllIcons(): HTMLLinkElement[] {
        return Array.from(this.head.querySelectorAll<HTMLLinkElement>('link[rel]'))
            .filter((linkEl: HTMLLinkElement) =>
                ICON_RELS.includes(linkEl.rel)
            );
    }

    private backupDefaultIcons() {
        const defaultIcons: IconSet = [];
        this.getAllIcons()
            .forEach((iconEl: HTMLLinkElement) => {
                defaultIcons.push({
                    rel: iconEl.rel,
                    type: iconEl.type,
                    sizes: iconEl.sizes.value,
                    href: iconEl.href,
                });
            });
        this.appIcons[DEFAULT_ICON_KEY] = defaultIcons;
    }

    private removeIcons() {
        this.getAllIcons().forEach((iconEl: HTMLLinkElement) => {
            this.head.removeChild(iconEl);
        });
    }

    private setIcons(iconSet: IconSet) {
        for (const icon of iconSet) {
            const linkElement = document.createElement('link');
            icon.rel ? linkElement.setAttribute('rel', icon.rel) : noop();
            icon.type ? linkElement.setAttribute('type', icon.type) : noop();
            icon.href ? linkElement.setAttribute('href', icon.href) : noop();
            icon.sizes ? linkElement.setAttribute('sizes', icon.sizes) : noop();
            this.head.appendChild(linkElement);
        }
    }

}
