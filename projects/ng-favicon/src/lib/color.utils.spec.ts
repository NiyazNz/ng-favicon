import {ColorUtils, RgbColor} from './color.utils';


const color: RgbColor = {
    red: parseInt('cc', 16),
    green: parseInt('ff', 16),
    blue: parseInt('33', 16),
    alpha: parseInt('ff', 16),
};


describe('ColorUtils', () => {
    it('should convert hex', () => {
        expect(ColorUtils.hexToRgba('#ccff33')).toEqual(color);
    });

    it('should convert hex with alpha', () => {
        expect(ColorUtils.hexToRgba('#ccff33ff')).toEqual(color);
    });

    it('should convert short hex', () => {
        expect(ColorUtils.hexToRgba('#cf3')).toEqual(color);
    });

    it('should convert short hex with alpha', () => {
        expect(ColorUtils.hexToRgba('#cf3f')).toEqual(color);
    });
});
