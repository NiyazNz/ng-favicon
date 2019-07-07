export interface RgbColor {
    red: number;
    green: number;
    blue: number;
    alpha?: number;
}


export class ColorUtils {
    public static hexToRgba(hex: string): RgbColor {
        hex = hex.startsWith('#') ? hex.slice(1) : hex;
        if (![3, 4, 6, 8].includes(hex.length) || !/^([a-fA-F\d])+$/.test(hex)) {
            throw Error('Invalid color');
        }
        if (hex.length <= 4) {
            hex = Array.from(hex).map(i => i + i).join('');
        }
        if (hex.length === 6) {
            hex += 'ff';
        }
        const value = parseInt(hex, 16);
        return {
            // tslint:disable:no-bitwise
            red: value >> (8 * 3) & 255,
            green: value >> (8 * 2) & 255,
            blue: value >> 8 & 255,
            alpha: value & 255,
            // tslint:enable:no-bitwise
        };
    }
}
