import {Observable} from 'rxjs';


export interface Icon {
    href: string;
    rel?: string;
    type?: string;
    sizes?: string;
}


export interface SizedIcons {
    [sizes: string]: Icon;
}


export interface NamedIcons {
    [name: string]: Icon | Icon[];
}


export interface FaviconConfig {
    /** Named icons */
    icons?: NamedIcons;
    /** Text color */
    color?: string;
    /** Background color */
    bgColor?: string;
}


export type GetIconFn = (options: any, defaultIcons: SizedIcons) => Observable<Icon[]>;
