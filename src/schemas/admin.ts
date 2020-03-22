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
                name: customStringJoi.customValidation().generateRandomName(),
                dateOfBirth: Joi.date().format('DD-MM-YYYY').raw(),
                email: Joi.string().lowercase().email(),
                gender: Joi.string().valid('male', 'female', 'other'),
                userId: phoneJoi.string().phoneNumber({defaultCountry: 'IN', strict: true}).required(),
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
    getCampaigns: {
        schema: {
            queryString: Joi.object().keys({
                live: Joi.boolean().default(false)
            })
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
    getReports: {
        schema: {
            queryString: Joi.object().keys({
                lastRecordCreatedAt: Joi.date(),
                userId: Joi.string(),
                status: Joi.string().valid('ACCEPTED', 'REJECTED', 'SUBMITTED'),
                campaignId: Joi.objectId()
            }).optional()
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
    addRewards: {
        schema: {
            body: Joi.object().keys({
                title: Joi.string(),
                description: Joi.string(),
                file: Joi.array().items(Joi.object().keys({
                    filename: Joi.string().required(),
                    data: Joi.binary()
                }).options({ allowUnknown: true })).required(),
                gems: Joi.number().required(),
                validFrom: Joi.date().format('DD-MM-YYYY').raw().required(),
                validTill: Joi.date().format('DD-MM-YYYY').raw().required(),
            }).min(1).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    editRewards: {
        schema: {
            body: Joi.object().keys({
                title: Joi.string(),
                description: Joi.string(),
                file: Joi.array().items(Joi.object().keys({
                    filename: Joi.string().required(),
                    data: Joi.binary()
                }).options({ allowUnknown: true })).default([]),
                gems: Joi.number(),
                validFrom: Joi.date().format('DD-MM-YYYY').raw(),
                validTill: Joi.date().format('DD-MM-YYYY').raw(),
            }).min(1),
            params: Joi.object().keys({
                rewardId: Joi.string().required(),
            }).required(),
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
};
export default adminSchema;
