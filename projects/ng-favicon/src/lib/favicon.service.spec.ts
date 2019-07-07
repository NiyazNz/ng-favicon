import {TestBed} from '@angular/core/testing';
import {DEFAULT_ICON_KEY, FAVICON_CONFIG, FaviconService, TEMP_ICON_KEY} from './favicon.service';
import {Icon} from './favicon.types';
import {of} from 'rxjs';
import {iconMatcher} from '../../test/matchers/icon.matcher';


const IMAGE_MOCK = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAALUlEQVRYR+3QQREAAAABQfqXFs
NnFTizzXk99+MAAQIECBAgQIAAAQIECBAgMBo/ACHo7lH9AAAAAElFTkSuQmCC`;
const icon32: Icon = {
    rel: 'icon', type: 'image/png', sizes: '32x32',
    href: 'assets/images/favicons/favicon-test-32x32.png',
};
const icon16: Icon = {
    rel: 'icon', type: 'image/png', sizes: '16x16',
    href: 'assets/images/favicons/favicon-test-16x16.png',
};

const getIconConfigProvider = (icons: Icon | Icon[]) => {
    return {
        provide: FAVICON_CONFIG,
        useValue: {
            icons: {
                test: icons,
            },
        },
    };
};

function queryAndGetOneFavicon() {
    const icons = document.head.querySelectorAll<HTMLLinkElement>('link[rel="icon"]');
    expect(icons.length).toBe(1);
    return icons[0];
}

function mockDefaultIcons(service) {
    spyOnProperty<any>(service, 'defaultIcons', 'get')
        .and.returnValue({'32x32': {rel: 'icon', href: IMAGE_MOCK} as Icon});
}

beforeEach(() => {
    jasmine.addMatchers(iconMatcher);
});

describe('FAVICON_CONFIG', () => {
    // tslint:disable:no-string-literal
    it('should be optional', () => {
        TestBed.configureTestingModule({
            providers: [
                FaviconService,
            ],
        });
        const service: FaviconService = TestBed.get(FaviconService);
        expect(service['faviconConfig']).not.toBeNull();
        expect(service['faviconConfig']).toEqual({});
        expect(service['appIconsCache']).toEqual({});
    });

    it('should accept single icon object in configuration', () => {
        TestBed.configureTestingModule({
            providers: [
                getIconConfigProvider(icon32),
                FaviconService,
            ],
        });
        const service: FaviconService = TestBed.get(FaviconService);
        expect(service['appIconsCache']['test']).toBeTruthy();
        expect(service['appIconsCache']['test']).toBeIcon(icon32);
    });

    it('should accept icon list in configuration', () => {
        TestBed.configureTestingModule({
            providers: [
                getIconConfigProvider([icon32, icon16]),
                FaviconService,
            ],
        });
        const service: FaviconService = TestBed.get(FaviconService);
        expect(service['appIconsCache']['test']).toBeTruthy();
        expect((service['appIconsCache']['test'] as Array<Icon>).length).toBe(2);
    });
    // tslint:enable:no-string-literal
});

describe('FaviconService.appIconsCache', () => {
    let service: FaviconService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                getIconConfigProvider([icon32]),
                FaviconService,
            ],
        });
        service = TestBed.get(FaviconService);
    });

    // tslint:disable:no-string-literal
    it('should cache icon', () => {
        service.cacheIcon('test2', icon16.href, icon16.rel, icon16.type, icon16.sizes);
        service.cacheIcons('test3', [icon16]);
        expect(service['appIconsCache']['test2']).toBeTruthy();
        expect(service['appIconsCache']['test3']).toBeTruthy();
        expect(service['appIconsCache']['test2'][0]).toBeIcon(service['appIconsCache']['test3'][0]);
    });

    it('should override cache', () => {
        expect(service['appIconsCache']['test'][0]).toBeIcon(icon32);
        service.cacheIcons('test', [icon16]);
        expect(service['appIconsCache']['test'][0]).toBeIcon(icon16);
    });
    // tslint:enable:no-string-literal
});

describe('FaviconService', () => {
    let service: FaviconService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                getIconConfigProvider([icon32]),
                FaviconService,
            ],
        });
        service = TestBed.get(FaviconService);
        document.head.querySelectorAll('link[rel]').forEach(node => document.head.removeChild(node));
    });

    it('should set configured icon by name', () => {
        service.set('test');
        expect(service.current).toBe('test');
        const icon = queryAndGetOneFavicon();
        expect(icon).toBeIcon(icon32);
    });

    it('should set default icon', () => {
        const linkElement = document.createElement('link');
        linkElement.setAttribute('href', icon16.href);
        linkElement.setAttribute('rel', icon16.rel);
        document.head.appendChild(linkElement);

        const defaultIcon = queryAndGetOneFavicon();
        service.set('test');
        service.setDefault();
        expect(service.current).toBe(DEFAULT_ICON_KEY);
        const restoredDefaultIcon = queryAndGetOneFavicon();
        expect(restoredDefaultIcon).toBeIcon(defaultIcon);
    });

    it('should set icon', () => {
        service.setIcon(icon32.href, icon32.rel, icon32.type, icon32.sizes);
        expect(service.current).toBe(TEMP_ICON_KEY);
        const icon = queryAndGetOneFavicon();
        expect(icon).toBeIcon(icon32);
    });

    it('should set icons', () => {
        service.setIcons([icon32]);
        expect(service.current).toBe(TEMP_ICON_KEY);
        const icon = queryAndGetOneFavicon();
        expect(icon).toBeIcon(icon32);
    });

    it('should set custom icon', async () => {
        const icons = await service.setCustom((options, defaultIcons) => of([icon32])).toPromise();
        expect(service.current).toBe(TEMP_ICON_KEY);
        const icon = queryAndGetOneFavicon();
        expect(icon).toBeIcon(icons[0]);
        expect(icon).toBeIcon(icon32);
    });

    it('should set dot on icon', async () => {
        mockDefaultIcons(service);
        const icons = await service.setDot().toPromise();
        expect(service.current).toBe('dot');
        const icon = queryAndGetOneFavicon();
        expect(icon).toBeIcon(icons[0]);
        expect(icon.href).toBeTruthy();
        expect(icon.href).not.toBe(IMAGE_MOCK);
    });

    it('should set numbers on icon', async () => {
        mockDefaultIcons(service);
        const icons1 = await service.setNumber(1).toPromise();
        expect(service.current).toBe('1');
        const icon1 = queryAndGetOneFavicon();
        expect(icon1).toBeIcon(icons1[0]);
        expect(icon1.href).toBeTruthy();
        expect(icon1.href).not.toBe(IMAGE_MOCK);

        const icons2 = await service.setNumber(2).toPromise();
        expect(service.current).toBe('2');
        const icon2 = queryAndGetOneFavicon();
        expect(icon2).toBeIcon(icons2[0]);
        expect(icon2.href).toBeTruthy();
        expect(icon2.href).not.toBe(IMAGE_MOCK);
        expect(icon2.href).not.toBe(icon1.href);
    });
});
