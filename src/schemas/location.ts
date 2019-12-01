import Joi from '@hapi/joi';

const locationSchema = {
    add: {
        schema: {
            body: Joi.object().keys({
                locationNm: Joi.string().required(),
                location: Joi.object().keys({
                    coordinates: Joi.array().items(Joi.array(), Joi.number()),
                }),
                state: Joi.string().required(),
                country: Joi.string().required(),
            }).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    get: {
        schema: {
            query: {
                location: Joi.string().required()
            }
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    }
};
export default locationSchema;
