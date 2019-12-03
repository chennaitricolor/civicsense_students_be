import joiObjectId from 'joi-objectid';
import { customStringJoi, Joi, phoneJoi } from '../util/joiHelper';

Joi.objectId = joiObjectId(Joi);

const userSchema = {
    post: {
        schema: {
            body: Joi.object().keys({
                name: customStringJoi.customValidation().filterBadWords().required(),
                dateOfBirth: Joi.date().format('DD-MM-YYYY').raw().required(),
                phoneNumber: phoneJoi.string().phoneNumber({defaultCountry: 'IN', strict: true})
                    .when('dateOfBirth', {
                        is: customStringJoi.customValidation().adultCheck(),
                        then: Joi.optional(),
                        otherwise: Joi.required()
                    }),
                email: Joi.string().lowercase().email().required(),
                gender: Joi.string().valid('male', 'female', 'other'),
                userId: customStringJoi.customValidation().filterBadWords().lowercase().required(),
                password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/).required(),
                avatar: Joi.number().min(1).max(8).default(1),
                otp: {
                    mobile: Joi.number().max(9999).required(),
                    email: Joi.number().max(9999).required()
                },
                currentLocation: Joi.object().keys({
                    coordinates: Joi.array().items(Joi.number()),
                }).required()
            }).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    availability: {
        schema: {
            params: {
                userId: Joi.string().lowercase().required(),
            }
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    addTask: {
        schema: {
            body: Joi.object().keys({
                location: Joi.object().keys({
                    coordinates:  Joi.array().items(Joi.number()),
                }).required(),
                locationNm: Joi.string().required(),
                campaignId: Joi.string().required(),
                file: Joi.array().items(Joi.object().keys({
                    filename: Joi.string().required(),
                    data: Joi.binary()
                }).options({ allowUnknown: true })).required()
            }).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    addDevice: {
        schema: {
            body: Joi.object().keys({
                deviceToken: Joi.string().required(),
                platform: Joi.string().valid('APNS', 'FCM', 'ADM', 'MPNS', 'WNS').required(),
            }).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    forgotUserId: {
        schema: {
            querystring: Joi.object().keys({
                email: Joi.string().lowercase().email().required(),
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
    updateProfile: {
        schema: {
            body: Joi.object().keys({
                newValues: Joi.object().keys({
                    phoneNumber: phoneJoi.string().phoneNumber({defaultCountry: 'IN', strict: true}),
                    email: Joi.string().lowercase().email(),
                    avatar: Joi.number().min(1).max(8).default(1),
                }).min(1).required(),
                otp: Joi.object().keys({
                    mobileOtp: Joi.number().max(9999),
                    emailOtp: Joi.number().max(9999)
                }).default({})
            }).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    updateLocation: {
        schema: {
            body: Joi.object().keys({
                currentLocation: Joi.object().keys({
                    coordinates: Joi.array().items(Joi.number()),
                }).required(),
                pastLocation: Joi.objectId(),
                inUse: Joi.boolean().default(false)
            }).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    changePassword: {
        schema: {
            body: Joi.object().keys({
                password: Joi.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/).required()
            }).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    getTasks: {
        schema: {
            querystring: Joi.object().keys({
                coordinates: Joi.array().items(Joi.number())
            })
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    getTask: {
        schema: {
            params: {
                taskId: Joi.objectId().required()
            }
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },
    getLeaderboard: {
        schema: {
            querystring: {
                type: Joi.string().valid('local')
            }
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    },

    generateOTP: {
        schema: {
            querystring: Joi.object().keys({
                email: Joi.string().lowercase().email(),
                phoneNumber: phoneJoi.string().phoneNumber({defaultCountry: 'IN', strict: true}),
            }).min(1).required()
        },
        schemaCompiler: (schema) => (data) => {
            return Joi.validate(data, schema);
        },
        attachValidation: true
    }

};
export default userSchema;
