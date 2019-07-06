export interface RgbColor {
    r: number;
    g: number;
    b: number;
    a?: number;
}


export class ColorUtils {
    public static hexToRgba(hex: string): RgbColor {
        hex = hex.startsWith('#') ? hex.slice(1) : hex;
        if (![3, 4, 6, 8].includes(hex.length)) {
            throw Error('Invalid color');
        }
        const keys = Array.from((hex.length % 3) ? 'rgba' : 'rgb').reverse();
        const bits = (hex.length > 4) ? 8 : 4;
        const value = parseInt(hex, 16);
        return keys.reduce((color, key, i) => {
            color[key] = value >> (bits * i) & (2 ** bits - 1);  // tslint:disable-line:no-bitwise
            return color;
        }, {} as RgbColor);
    }
}
