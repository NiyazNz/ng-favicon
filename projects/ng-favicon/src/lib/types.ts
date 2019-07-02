import {Observable} from 'rxjs';


export interface Icon {
    href: string;
    rel?: string;
    type?: string;
    sizes?: string;
}


export interface IconMap {
    [sizes: string]: Icon;
}


export interface FaviconConfig {
    [name: string]: Icon | Icon[];
}


export type GetIconFn = (options: any, defaultIcons: IconMap) => Observable<Icon[]>;
