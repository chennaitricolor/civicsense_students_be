import _ from 'lodash';
export const mergeIgnoringUndefined = (source: object, target: object): object => {
    return _.mergeWith({}, source, target, (a, b) => b === undefined ? a : undefined);
};
