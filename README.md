# ng-favicon

A simple angular service to change favicon or display unread messages and notifications on top of favicon

[![npm version](https://img.shields.io/npm/v/@enzedd/ng-favicon.svg)](https://npmjs.com/package/@enzedd/ng-favicon "View on npm")
[![Gitlab pipeline status](https://img.shields.io/gitlab/pipeline/Enzedd/ng-favicon.svg)](https://gitlab.com/Enzedd/ng-favicon/pipelines)
[![coverage report](https://gitlab.com/Enzedd/ng-favicon/badges/master/coverage.svg)](https://gitlab.com/Enzedd/ng-favicon/commits/master)

```html
this.faviconService.set('iconName');
```
![ng-favicon](https://gitlab.com/Enzedd/ng-favicon/uploads/965406318838c0e9872f564b6d30252f/ng-favicon.png)

* Simple favicon changes
* Configurable icon sets
* Predefined renderers to display unread messages and notifications on top of default favicon
* Custom resolvers and icon generators can be plugged in

## Examples/Demo
* [Demo](https://enzedd.gitlab.io/ng-favicon/)
* A simple example can be found under `src/app` directory of this repository.

## Getting started

### Step 1: Install `ng-favicon`:
npm
```shell
npm install --save @enzedd/ng-favicon
```
yarn
```shell
yarn add @enzedd/ng-favicon
```

### Step 2: Import `FaviconModule`:
```typescript
import {FaviconModule} from '@enzedd/ng-favicon';

@NgModule({
  declarations: [AppComponent],
  imports: [
    ...
    FaviconModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### Step 3: Inject `FaviconService` in component constructor
```typescript
import {FaviconService} from '@enzedd/ng-favicon';

@Component({
    ...
})
export class AppComponent {
    constructor(private faviconService: FaviconService) {
    }
}
``` 

### Step 4: Use `FaviconService` methods to set favicons
```typescript
import {FaviconService} from '@enzedd/ng-favicon';

@Component({
    ...
    template: `<button type="button" (click)="setFavicon($event)">Set favicon</button>`,
})
export class AppComponent {
    constructor(private faviconService: FaviconService) {
    }

    setFavicon($event) {
        $event.preventDefault();
        this.faviconService.setDot();
    }
}
```


## Configuration
Configure application favicons by providing values for `FAVICON_CONFIG` token in a NgModule e.g. src/app/app.module.ts
```typescript
import {FAVICON_CONFIG} from '@enzedd/ng-favicon';

@NgModule({
    ...
    providers: [
        {
            provide: FAVICON_CONFIG,
            useValue: {
                dotted: [{
                    rel: 'icon',
                    type: 'image/png',
                    sizes: '32x32',
                    href: 'assets/images/favicons/favicon-dotted-32x32.png'
                }],
            },
        },
    ],
})
export class AppModule {
}
```
Values can be provided as a single icon or as icon set (multiple sizes of same icon for different devices).
It is recommended to keep in sync icon count and types in html and configuration. Otherwise app icon may disappear on some devices when changed.
```typescript
    providers: [
        {
            provide: FAVICON_CONFIG,
            useValue: {
                dotted: [
                    {
                        rel: 'icon', type: 'image/png', sizes: '16x16',
                        href: 'assets/images/favicons/favicon-dotted-16x16.ico'
                    },
                    {
                        rel: 'icon', type: 'image/png', sizes: '32x32',
                        href: 'assets/images/favicons/favicon-dotted-32x32.ico'
                    },
                ],
            },
        },
    ],
```

## API
### Methods
#### setDefault()
Resets favicon to default

#### set()
Sets favicon by name. Requires favicons to be configured. See [Configuration](#configuration) section for details.

| Parameter  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| name | string |  null | no | Name of icon or icon set. If name is null, resets to default.

#### setIcon()
| Parameter  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| href | string |  - | yes | Icon url or dataUrl
| rel | string |  'icon' | no | Icon rel
| type | string |  null | no | Icon type
| sizes | string |  null | no | Icon size
| cacheKey | string |  null | no | Cache key. If set, icon is cached and accessible by name

#### setIcons()
| Parameter  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| icons | [Icon](#Icon)[] |  - | yes | Icon set
| cacheKey | string |  null | no | Cache key. If set, icon set is cached and accessible by name

#### setNumber()
Sets number overlay on default favicon. Use to display unread messages and notifications.

| Parameter  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| num | number | - | yes | Number to set
| options | [NumberRendererOptions](#numberrendereroptions) | null | no | Options

returns Icon set observable

#### setDot()
Sets dot overlay on default favicon. Use to indicate the presence of notifications.

| Parameter  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| options | [DotRendererOptions](#dotrendereroptions) | null | no | Options

returns Icon set observable

#### setCustom()
Sets custom favicon using GetIconFn. Use for custom implementations of favicon resolving or generation.

| Parameter  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| getIconFn | [GetIconFn](#geticonfn) | - | yes | Icon resolving or generating function
| options | any | null | no | Options
| cacheKey | string | null | no | Cache key. If set icon is cached and not regenerated again

returns Icon set observable

##### Example 1: Resolve favicon
Do any icon handling to get new favicon url
```typescript
setCustomFavicon1($event) {
    function getIcon(options, defaultIcons?: IconMap): Observable<Icon[]> {
        const icon: Icon = Object.values(defaultIcons)[0];
        const url = icon.href.slice(0, icon.href.length - 9) + 'dotted' + icon.href.slice(icon.href.length - 10, icon.href.length);
        return of([{
            rel: icon.rel, type: icon.type, sizes: icon.sizes,
            href: url,
        }]);
    }

    $event.preventDefault();
    this.faviconService.setCustom(getIcon);
}
```
##### Example 2: Generate favicon
Provide function to draw your own favicon
```typescript
setCustomFavicon2($event) {
    function dotRenderer(options, defaultIcons?: IconMap): Observable<Icon[]> {
        const icon: Icon = Object.values(defaultIcons)[0];
        const img: HTMLImageElement = new Image();
        img.src = icon.href;
        return fromEvent(img, 'load').pipe(
            map((event: Event) => event.target),
            map((image: HTMLImageElement) => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0);
                context.fillStyle = 'blue';
                context.beginPath();
                context.arc(context.canvas.width * 0.7, context.canvas.height * 0.75,
                    context.canvas.width * 0.25, 0, Math.PI * 2);
                context.closePath();
                context.fill();
                return [{
                    rel: icon.rel, type: icon.type, sizes: icon.sizes,
                    href: canvas.toDataURL(),
                }];
            })
        );
    }

    $event.preventDefault();
    this.faviconService.setCustom(dotRenderer);
}
```
#### cacheIcon()
Put icon to cache in runtime. May override configured icons.

| Parameter  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| name | string | - | yes | Cache key
| href | string | - | yes | Icon url or dataUrl
| rel | string | 'icon' | no | Icon rel
| type | string | null | no | Icon type
| sizes | string | null | no | Icon size

#### cacheIcons()
Put icon set to cache in runtime. May override configured icons.

| Parameter  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| href | string | - | yes | Icon url or dataUrl
| iconSet | [Icon](#icon)[] | - | yes | Icon set

#### resetCache() 
Resets cache to configured only favicons

### Interfaces
#### NumberRendererOptions
| Field  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| color | string | '#fff' | no | Number color (hex format)
| bgColor | string | '#f00' | no | Number background color (hex format)

#### DotRendererOptions
| Field  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| color | string | '#f00' | no | Dot color (hex format)
| centerX | number | 0.7 | no | Relative position by x axis (from 0 to 1)
| centerY | number | 0.25 | no | Relative position by y axis (from 0 to 1)
| radius | number | 0.25 | no | Radius relative to icon size (from 0 to 1)

#### GetIconFn
| Parameter  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| options | any |  | yes | Options passed from setCustom
| defaultIcons | [sizes: string]: [Icon](#icon) |  | yes | Default icons

returns `Observable<Icon[]>`

#### Icon
| Field  | Type | Default | Required | Description |
| ------------- | ------------- | ------------- | ------------- | ------------- |
| href | string |  | yes | Icon url or dataUrl
| rel | string | null | no | Icon rel
| type | string | null | no | Icon type
| sizes | string | null | no | Icon size

## Development
Library location is under `projects/ng-favicon` directory of this repository.

Demo application is under `src` directory of this repository.

### Development server
Run `npm run lib:watch` to incrementally build library as a background process in your dev environment

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build library
Run `npm run lib:build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Publishing
After building your library, go to the dist folder `cd dist/ng-favicon` and run `npm publish`.

### Running unit tests
Run `npm run lib:test` to execute the library unit tests via [Karma](https://karma-runner.github.io).
