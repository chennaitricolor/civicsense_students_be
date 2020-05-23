import _ from 'lodash';
export const mergeIgnoringUndefined = (source: object, target: object): object => {
    return _.mergeWith({}, source, target, (a, b) => b === undefined ? a : undefined);
};

export const XOR = (a, b) => ( a || b ) && !( a && b );

export const validator = (data: { [x: string]: any; }, validations: { [x: string]: (arg0: any) => boolean; }, getResult: (arg0: { [x: string]: boolean}) => boolean) => {
    const validationResult = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            validationResult[key] = validations[key] ? validations[key](data[key]) : true;
        }
    }
    return { result: getResult(validationResult), validationResult};
};
