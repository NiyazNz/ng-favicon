import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, InjectionToken, Optional, Renderer2, RendererFactory2} from '@angular/core';
import {noop, Observable, ReplaySubject} from 'rxjs';
import {FaviconConfig, GetIconFn, Icon, IconMap} from './favicon.types';
import {DotRenderer, DotRendererOptions} from './renderers/dot-renderer';
import {NumberRenderer, NumberRendererOptions} from './renderers/number-renderer';
import {take} from 'rxjs/operators';


export const DEFAULT_ICON_KEY = '__default';
export const TEMP_ICON_KEY = '__temp';
const DEFAULT_REL = 'icon';
const ICON_RELS = [
    DEFAULT_REL,
    'apple-touch-icon',
    'apple-touch-icon-precomposed',
    'mask-icon',
];


export const FAVICON_CONFIG = new InjectionToken<FaviconConfig>('Favicon Configuration');


@Injectable({
    providedIn: 'root',
})
export class FaviconService {
    private renderer: Renderer2;
    private head: HTMLHeadElement;
    private _current: string = DEFAULT_ICON_KEY;
    private _defaultIcons: IconMap;
    private appIconsCache: FaviconConfig;

    /**
     * Returns current icon set name
     */
    public get current(): string {
        return this._current;
    }

    private get defaultIcons(): IconMap {
        return this.backupDefaultDomIcons();
    }

    constructor(
        private rendererFactory: RendererFactory2,
        @Inject(DOCUMENT) private document,
        @Optional() @Inject(FAVICON_CONFIG) private readonly faviconConfig: FaviconConfig,
    ) {
        this.renderer = rendererFactory.createRenderer(null, null);
        this.document = document as Document;
        this.head = document.head;
        this.resetCache();
    }

    /**
     * Resets cache to configured only favicons
     */
    public resetCache() {
        this.appIconsCache = Object.assign({}, this.faviconConfig); // TODO change to get from faviconConfig.icons
    }

    /**
     * Cache icon
     *
     * Puts icon to cache in runtime. May override configured icons.
     *
     * @param name Cache key
     * @param href Icon url
     * @param rel Icon rel
     * @param type Icon type
     * @param sizes Icon sizes
     */
    public cacheIcon(name: string, href: string, rel?: string, type?: string, sizes?: string) {
        this.cacheIcons(name, [{href, rel, type, sizes}]);
    }

    /**
     * Cache icon set
     *
     * Put icon set to cache in runtime. May override configured icons.
     *
     * @param name Cache key
     * @param iconSet Icon set
     */
    public cacheIcons(name: string, iconSet: Icon[]) {
        if (name !== DEFAULT_ICON_KEY && name !== TEMP_ICON_KEY) {
            this.appIconsCache[name] = iconSet;
        }
    }

    /**
     * Resets favicon to default
     */
    public setDefault() {
        this.set(DEFAULT_ICON_KEY);
    }

    /**
     * Sets favicon by name.
     *
     * Requires favicons to be configured. See [Configuration](https://gitlab.com/Enzedd/ng-favicon#configuration) section for details
     *
     * @param name Name of icon or icon set. If name is null, resets to default
     */
    public set(name?: string) {
        name = name || DEFAULT_ICON_KEY;
        const iconSet = this.getIconSet(name);
        this.setIcons(iconSet, name);
    }

    /**
     * Set icon
     *
     * @param href favicon url or dataUrl
     * @param rel favicon rel
     * @param type favicon type
     * @param sizes favicon sizes
     * @param cacheKey Cache key. If set, icon is cached and accessible by name
     */
    public setIcon(href: string, rel?: string, type?: string, sizes?: string, cacheKey?: string) {
        this.setIcons([{rel, type, sizes, href}], cacheKey);
    }

    /**
     * Set icon set
     * @param icons Icon set
     * @param cacheKey Cache key. If set, icon is cached and accessible by name
     */
    public setIcons(icons: Icon[], cacheKey?: string) {
        const name = cacheKey || TEMP_ICON_KEY;
        if (this.isChangeRequired(name)) {
            this.changeDomIcons(name, icons);
        }
    }


    /**
     * Sets number overlay on default favicon.
     *
     * Use to display unread messages and notifications.
     *
     * @param num Number to set
     * @param options Options. See [NumberRendererOptions](https://gitlab.com/Enzedd/ng-favicon#numberrendereroptions)
     * @returns Icon set observable
     */
    public setNumber(num, options?: NumberRendererOptions): Observable<Icon[]> {
        const renderer = new NumberRenderer();
        const rendererFn = renderer.render.bind(renderer, num);
        return this.setCustom(rendererFn, options, num > 0 && num < 10 ? String(num) : null);
    }

    /**
     * Sets dot overlay on default favicon.
     *
     * Use to indicate the presence of notifications.
     *
     * @param options Options. See [DotRendererOptions](https://gitlab.com/Enzedd/ng-favicon#dotrendereroptions)
     * @returns Icon set observable
     */
    public setDot(options?: DotRendererOptions): Observable<Icon[]> {
        return this.setCustom(DotRenderer.renderRightTop, options, 'dot');
    }

    /**
     * Sets custom favicon using GetIconFn
     *
     * Use for custom implementations of favicon resolving or generation.
     *
     * @param getIconFn Icon resolving or generating function
     * @param options Options
     * @param cacheKey Cache key. If set, icon is cached and not regenerated again
     * @returns Icon set observable
     */
    public setCustom(getIconFn: GetIconFn, options = {}, cacheKey?: string): Observable<Icon[]> {
        const done = new ReplaySubject<Icon[]>(1);
        const name = cacheKey || TEMP_ICON_KEY;
        if (!this.isChangeRequired(name)) {
            done.next(null);
        } else {
            if (name !== TEMP_ICON_KEY && this.appIconsCache[name]) {
                this.set(name);
                return;
            }
            getIconFn(options, this.defaultIcons)
                .subscribe((icons: Icon[]) => {
                    this.setIcons(icons, name);
                    done.next(icons);
                });
        }
        return done.pipe(take(1));
    }

    private isChangeRequired(name) {
        return name !== this._current || name === TEMP_ICON_KEY;
    }

    private getIconSet(name: string): Icon[] {
        if (!name || name === DEFAULT_ICON_KEY) {
            return this.getDefaultIconSet();
        } else if (this.appIconsCache[name]) {
            return ((this.appIconsCache[name] instanceof Array) ? this.appIconsCache[name] : [this.appIconsCache[name]]) as Icon[];
        }
    }

    private getDefaultIconSet(): Icon[] {
        return Object.values(this.defaultIcons);
    }

    private getSelector(icon: Icon): string {
        let selector = 'link';
        selector += icon.rel ? `[rel="${icon.rel}"]` : '[rel]';
        selector += icon.type ? `[type="${icon.type}"]` : '';
        selector += icon.sizes ? `[sizes="${icon.sizes}"]` : '';
        return selector;
    }

    private getDomIcons(): HTMLLinkElement[] {
        const selector = this.getSelector({} as Icon);
        return Array.from(this.head.querySelectorAll<HTMLLinkElement>(selector))
            .filter((linkEl: HTMLLinkElement) => {
                    return ICON_RELS.includes(linkEl.rel);
                },
            );
    }

    private backupDefaultDomIcons() {
        if (!this._defaultIcons) {
            this._defaultIcons = {};
            this.getDomIcons()
                .forEach((iconEl: HTMLLinkElement) => {
                    const icon: Icon = {
                        rel: iconEl.rel,
                        type: iconEl.type,
                        sizes: iconEl.sizes.value,
                        href: iconEl.href,
                    };
                    this._defaultIcons[icon.sizes] = icon;
                });
        }
        return this._defaultIcons;
    }


    private changeDomIcons(name: string, iconSet: Icon[]) {
        this.backupDefaultDomIcons();
        this.cacheIcons(name, iconSet);
        if (iconSet.length) {
            this.removeDomIcons();
            this.setDomIcons(iconSet);
            this._current = name;
        }
    }

    private removeDomIcons() {
        this.backupDefaultDomIcons();
        this.getDomIcons().forEach((iconEl: HTMLLinkElement) => {
            this.renderer.removeChild(this.head, iconEl);
        });
    }

    private setDomIcons(icons: Icon[]) {
        this.backupDefaultDomIcons();
        for (const icon of icons) {
            const linkElement = this.renderer.createElement('link');
            this.renderer.setAttribute(linkElement, 'href', icon.href);
            this.renderer.setAttribute(linkElement, 'rel', icon.rel || DEFAULT_REL);
            icon.type ? this.renderer.setAttribute(linkElement, 'type', icon.type) : noop();
            icon.sizes ? this.renderer.setAttribute(linkElement, 'sizes', icon.sizes) : noop();
            this.renderer.appendChild(this.head, linkElement);
        }
    }

}
