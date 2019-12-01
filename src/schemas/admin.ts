import joiObjectId from 'joi-objectid';
import { customStringJoi, Joi, phoneJoi } from '../util/joiHelper';

Joi.objectId = joiObjectId(Joi);

const adminSchema = {
    addCampaigns: {
        schema: {
            body: Joi.object().keys({
                description: Joi.string().required(),
                rules: Joi.string().required(),
                rewards: Joi.number().required(),
                campaignName: Joi.string().required(),
                startDate: Joi.date().format('DD-MM-YYYY').raw().required(),
                endDate: Joi.date().format('DD-MM-YYYY').raw().required(),
                locationIds: Joi.array().items(Joi.objectId()).min(1).required(),
            }).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    add: {
        schema: {
            body: Joi.object().keys({
                name: customStringJoi.customValidation().filterBadWords().required(),
                dateOfBirth: Joi.date().format('DD-MM-YYYY').raw().required(),
                phoneNumber: phoneJoi.string().phoneNumber({defaultCountry: 'IN', strict: true}).required(),
                email: Joi.string().lowercase().email().required(),
                gender: Joi.string().valid('male', 'female', 'other'),
                userId: customStringJoi.customValidation().filterBadWords().lowercase().required(),
                password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/).required(),
            }).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    login: {
        schema: {
            body: Joi.object().keys({
                userId: Joi.string().lowercase().required(),
                password: Joi.string().required()
            }).required()

        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    getCampaignDetails: {
        schema: {
            params: Joi.object().keys({
                campaignId: Joi.objectId().required(),
            }).required(),
            queryString: Joi.object().keys({
                lastRecordCreatedAt: Joi.date()
            })
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    validateSubmission: {
        schema: {
            params: Joi.object().keys({
                submissionId: Joi.objectId().required(),
            }).required(),
            body: Joi.object().keys({
                status: Joi.string().valid('ACCEPTED', 'REJECTED', 'SUBMITTED').required(),
                comments: Joi.string(),
                campaignId: Joi.objectId().required(),
            }).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    getImage: {
        schema: {
            params: Joi.object().keys({
                imageId: Joi.string().required(),
            }).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
};
export default adminSchema;
