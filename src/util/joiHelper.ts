import BaseJoi from '@hapi/joi';
import joiDateExtension from 'joi-date-extensions';
import joiPhoneNumber from 'joi-phone-number';
import moment from 'moment';
import FilterWords from './filterBadWords';

const Joi = BaseJoi.extend(joiDateExtension);

interface IExtendedStringSchema extends  BaseJoi.StringSchema {
    adultCheck(): this;
    filterBadWords(): this;
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
        filterBadWords: 'Filter bad words'
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
            name: 'filterBadWords',
            validate(this: ICustomStringJoi, params, value, state, options) {
                const filterWords = new FilterWords();
                if (filterWords.filterBadWords(value)) {
                    return this.createError('customValidation.filterBadWords', {v : value}, state, options);
                }
                return value;
            }
        },
    ]
}));

export {
    phoneJoi,
    customStringJoi,
    Joi
};
