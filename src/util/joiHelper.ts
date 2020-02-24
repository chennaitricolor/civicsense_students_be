import BaseJoi from '@hapi/joi';
import joiDateExtension from 'joi-date-extensions';
import joiPhoneNumber from 'joi-phone-number';
import moment from 'moment';
import uniqid from 'uniqid';

const Joi = BaseJoi.extend(joiDateExtension);

interface IExtendedStringSchema extends  BaseJoi.StringSchema {
    adultCheck(): this;
    generateRandomName(): this;
    required(): this;
    lowercase(): this;
}

interface ICustomStringJoi extends BaseJoi.Root {
    customValidation(): IExtendedStringSchema;
    createError(a, b, c, d);
}

const phoneJoi = Joi.extend(joiPhoneNumber);
const customStringJoi: ICustomStringJoi = Joi.extend( (joi) => ({
    base: joi.string(),
    name: 'customValidation',
    language: {
        adultCheck: 'Age must be over 18',
        generateRandomName: 'Generates random name'
    },
    rules: [
        {
            name: 'adultCheck',
            validate(this: ICustomStringJoi, params, value, state, options) {
                const age = moment().diff(moment(value, 'DD-MM-YYYY'), 'years');
                if (age < 18) {
                    return this.createError('customValidation.adultCheck', {v : value}, state, options);
                }
                return value;
            }
        },
        {
            name: 'generateRandomName',
            validate(this: ICustomStringJoi, params, value, state, options) {
                if (!value) {
                    return uniqid('Guest_');
                }
                return uniqid(`${value}_`);
            }
        },
    ]
}));

export {
    phoneJoi,
    customStringJoi,
    Joi
};
