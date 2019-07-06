import {Icon} from '../../src/lib/favicon.types';


const noop = () => {
};
export const iconMatcher = {
    toBeIcon: (util, customEqualityTesters) => {
        return {
            compare: (actual: Icon | HTMLLinkElement, expected: Icon | HTMLLinkElement) => {
                const messages: string[] = [];
                !actual.href.endsWith(expected.href) ? messages.push('href mismatches') : noop();
                actual.rel !== expected.rel ? messages.push('rel mismatches') : noop();
                actual.type !== expected.type ? messages.push('type mismatches') : noop();
                actual.sizes.toString() !== expected.sizes.toString() ? messages.push('sizes mismatches') : noop();
                const message = messages.join('; ');
                return {
                    pass: !Boolean(message),
                    message: message || 'Passed'
                };
            }
        };
    }
};
