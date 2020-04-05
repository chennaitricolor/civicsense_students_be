import _ from 'lodash';
export const mergeIgnoringUndefined = (source: object, target: object): object => {
    return _.mergeWith({}, source, target, (a, b) => b === undefined ? a : undefined);
};

export const XOR = (a, b) => ( a || b ) && !( a && b );