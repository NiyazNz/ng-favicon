import {Inject, Injectable, InjectionToken, Optional, Renderer2, RendererFactory2} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {noop} from 'rxjs';
import {NumberRenderer, NumberRendererOptions} from './renderers/number-renderer';
import {DotRenderer, DotRendererOptions} from './renderers/dot-renderer';
import {FaviconConfig, GetIconFn, Icon, IconMap} from './types';


const DEFAULT_ICON_KEY = '__default';
const GENERATED_ICON_KEY = '__generated';


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
    private renderer: Renderer2;
    private head: HTMLHeadElement;
    private _current: string = DEFAULT_ICON_KEY;
    private defaultIcons: IconMap;

    get current(): string {
        return this._current;
    }

    constructor(
        private rendererFactory: RendererFactory2,
        @Inject(DOCUMENT) private document,
        @Optional() @Inject(FAVICON_CONFIG) private appIcons: FaviconConfig
    ) {
        this.renderer = rendererFactory.createRenderer(null, null);
        this.document = document as Document;
        this.head = document.head;
        this.appIcons = Object.assign({}, appIcons) as FaviconConfig;
    }

    public setDefault() {
        this.set(DEFAULT_ICON_KEY);
    }

    public set(name?: string) {
        this.backupDefaultIcons();
        name = name || DEFAULT_ICON_KEY;
        if (name === this._current && name !== GENERATED_ICON_KEY) {
            return;
        }
        this._current = name;

        let iconSet: Icon[];
        if (name === DEFAULT_ICON_KEY) {
            iconSet = Object.values(this.defaultIcons);
        } else if (this.appIcons[name]) {
            iconSet = ((this.appIcons[name] instanceof Array) ? this.appIcons[name] : [this.appIcons[name]]) as Icon[];
        }
        if (iconSet.length) {
            this.removeIcons();
            this.setIcons(iconSet);
        }
    }

    public setCustom(getIconFn: GetIconFn, options = {}, cacheKey?: string) {
        this.backupDefaultIcons();
        const name = cacheKey || GENERATED_ICON_KEY;
        if (name !== GENERATED_ICON_KEY && this.appIcons[name]) {
            this.set(name);
            return;
        }
        getIconFn(options, this.defaultIcons)
            .subscribe((icons: Icon[]) => {
                this.appIcons[name] = icons;
                this.set(name);
            });
    }

    public setNumber(num, options?: NumberRendererOptions) {
        const renderer = new NumberRenderer();
        const rendererFn = renderer.render.bind(renderer, num);
        this.setCustom(rendererFn, options, num > 0 && num < 10 ? num : null);
    }

    public setDot(options?: DotRendererOptions) {
        this.setCustom(DotRenderer.renderRightTop, options, 'dot');
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
        if (!this.defaultIcons) {
            this.defaultIcons = {};
            this.getAllIcons()
                .forEach((iconEl: HTMLLinkElement) => {
                    const icon: Icon = {
                        rel: iconEl.rel,
                        type: iconEl.type,
                        sizes: iconEl.sizes.value,
                        href: iconEl.href,
                    };
                    this.defaultIcons[icon.sizes] = icon;
                });
        }
    }

    private removeIcons() {
        this.getAllIcons().forEach((iconEl: HTMLLinkElement) => {
            this.renderer.removeChild(this.head, iconEl);
        });
    }

    private setIcons(icons: Icon[]) {
        for (const icon of icons) {
            const linkElement = this.renderer.createElement('link');
            icon.rel ? this.renderer.setAttribute(linkElement, 'rel', icon.rel) : noop();
            icon.type ? this.renderer.setAttribute(linkElement, 'type', icon.type) : noop();
            icon.href ? this.renderer.setAttribute(linkElement, 'href', icon.href) : noop();
            icon.sizes ? this.renderer.setAttribute(linkElement, 'sizes', icon.sizes) : noop();
            this.renderer.appendChild(this.head, linkElement);
        }
    }

}
