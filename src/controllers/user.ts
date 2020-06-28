'use strict';
import _ from 'lodash';
import mongoose from 'mongoose';
import UserSchema from '../schemas/user';
import { XOR } from '../util/helper';
import BaseController from './base';
class UserController extends BaseController {

    constructor(version) {
        super(version);
    }

    public setV1PreLoginRoutes =  async (fastify) => {
        const loginHandler = async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                if (request.body.userId === process.env.PHONE_NO || await fastify.verifyMobileOTP(request.body.userId, request.body.otp)) {
                    request.body.lastUsedDateTime = Date.now();
                    await fastify.insertUser(request.body, false);
                    request.session.user = {
                        userId: request.body.userId,
                        region: 'GCC',
                        persona: 'Citizen'
                    };
                    // save sessionId in redis
                    return reply.send({
                        success: true
                    });
                }
                return reply.status(401).send({
                    success: false
                });
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        };
        fastify.get('/user/valid', UserSchema.valid, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                await fastify.getZoneFromLocation(request.query.coordinates, 'Point', false);
                return reply.status(200).send({
                    success: true
                });
            } catch (error) {
                return reply.status(401).send({
                    message: 'App not supported'
                });

            }
        });
        fastify.get('/hotspots', {}, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                return reply.send(await fastify.awsPlugin.downloadFile(fastify.config.s3.kmlId, true));
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error: error .message,
                    message: 'error error.message ? error.message : happened'
                });

            }
        });
        fastify.get('/healthCenters', {}, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                return reply.send(await fastify.awsPlugin.downloadFile(fastify.config.s3.healthkmlId, true));
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error: error .message,
                    message: 'error error.message ? error.message : happened'
                });

            }
        });
        fastify.get('/testingCenters', {}, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                return reply.send(await fastify.awsPlugin.downloadFile(fastify.config.s3.testkmlId, true));
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error: error .message,
                    message: 'error error.message ? error.message : happened'
                });

            }
        });
        fastify.get('/treatmentCenters', {}, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                return reply.send(await fastify.awsPlugin.downloadFile(fastify.config.s3.treatmentkmlId, true));
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error: error .message,
                    message: 'error error.message ? error.message : happened'
                });

            }
        });
        fastify.get('/user/generate-otp', UserSchema.generateOTP, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {

                const { phoneNumber } = request.query;
                if (phoneNumber && !await fastify.generateMobileOTP(phoneNumber)) {
                    return reply.status(200).send({
                        success: false
                    });
                }
                return reply.status(200).send({
                    success: true
                });
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        });
        fastify.get('/', {}, async (request, reply) => {
            reply.status(200).send(await fastify.getStatic());
        });

        fastify.get('/download',  (req, reply) => {
            try {
                reply.sendFile('csr-prod V10.apk');
            } catch (e) {
                console.log(e);
            }
        });
        fastify.get('/user/verify-otp', UserSchema.generateOTP, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                const { phoneNumber, otp} = request.body;
                await fastify.verifyMobileOTP(phoneNumber, otp);
                request.session.phoneNumber = phoneNumber;
                return reply.status(200).send({
                    success: true
                });
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        });
        fastify.get('/user/resend-otp', UserSchema.generateOTP, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {

                const { phoneNumber, email} = request.query;
                if (phoneNumber && !await fastify.resendMobileOTP(phoneNumber)) {
                    return reply.status(200).send({
                        success: false
                    });
                }
                return reply.status(200).send({
                    success: true
                });
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        });
        fastify.post('/user/login', UserSchema.login, async (request, reply) => {
            await loginHandler(request, reply);
        });
        fastify.post('/user/signup', UserSchema.signup, async (request, reply) => {
            request.body.currentLocation = (await fastify.getZoneFromLocation(request.body.currentLocation.coordinates, 'Point')).id;
            request.body.defaultLocation = request.body.currentLocation;
            await loginHandler(request, reply);
        });
        fastify.get('public/images/:imageId', UserSchema.getImage, async (request, reply) => {
            try {
                return reply.send(await fastify.awsPlugin.downloadFile(request.params.imageId, request.query.isAsset, fastify.config.s3.publicBucketName));
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error: error .message,
                    message: 'error error.message ? error.message : happened'
                });

            }
        });
    };
    public setV2PreLoginRoutes = async (fastify) => {
        const loginHandler = async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                const { region: supportedRegions } = (await fastify.getStatic(2)).toObject();
                if (!Object.keys(supportedRegions).includes(request.headers.region) ) {
                    return reply.code(406).send({});
                }
                if (!supportedRegions[request.headers.region].userPersona.includes(request.body.persona) ) {
                    return reply.code(400).send({ message: 'Persona not allowed'});
                }
                if (request.body.userId === process.env.PHONE_NO || await fastify.verifyMobileOTP(request.body.userId, request.body.otp)) {
                    request.body.lastUsedDateTime = Date.now();
                    await fastify.insertUser({ ...request.body,  region: request.headers.region}, false);
                    request.session.user = {
                        userId: request.body.userId,
                        region: request.headers.region,
                        persona: request.body.persona
                    };
                    // save sessionId in redis
                    return reply.send({
                        success: true
                    });
                }
                return reply.status(401).send({
                    success: false
                });
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        };
        fastify.after(() => {
            fastify.addHook('onRequest', fastify.basicAuth);

            fastify.get('/', {}, async (request, reply) => {
                reply.status(200).send(await fastify.getStatic(2));
            });
          });
        fastify.post('/user/login', UserSchema.loginV2, async (request, reply) => {
            await loginHandler(request, reply);
        });
        fastify.post('/user/signup', UserSchema.signup, async (request, reply) => {
            request.body.currentLocation = (await fastify.getZoneFromLocation(request.body.currentLocation.coordinates, 'Point')).id;
            request.body.defaultLocation = request.body.currentLocation;
            await loginHandler(request, reply);
        });

    };
    public setV1PostLoginRoutes = async (fastify) => {
        fastify.get('/user', async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                const userData = await fastify.userIdAvailability(request.session.user.userId, false);
                if (userData) {
                    return reply.send(
                        userData
                    );
                }
                return reply.status(404).send();
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        });
        fastify.put('/user/update', UserSchema.updateProfile, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                await fastify.updateProfile(request.session.user.userId, request.body.newValues);
                return reply.status(200).send({
                    success: true
                });
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        });
        fastify.get('/user/tasks', UserSchema.getTasks, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                reply.send({
                    success: true,
                    tasks: await fastify.getUserTasks(request.session.user, request.query.coordinates)
                });
            } catch (error) {
                reply.status(500);
                reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }

        });
        fastify.get('/user/tasks/:taskId', UserSchema.getTask, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                reply.send({
                    success: true,
                    task: await fastify.getUserTask(request.params.taskId, request.session.user)
                });
            } catch (error) {
                reply.status(500);
                reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }

        });
        fastify.get('/user/leaderboard', UserSchema.getLeaderboard, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                reply.send({
                    success: true,
                    ...await fastify.getLeaderboard(request.session.user.userId, request.query.type)
                });
            } catch (error) {
                reply.status(500);
                reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }

        });
        fastify.post('/user/task', UserSchema.addTask, async (request, reply) => {
            const userTaskRequestValidation = async (userTaskDetails) => {
                if (XOR(userTaskDetails.needForm, request.body.formData)) {
                    return reply.code(400).send({
                        message: 'Check for needForm'
                    });
                }
                if (request.body.formData) {
                    const formDataCopy = JSON.parse(JSON.stringify(request.body.formData));
                    const campaignOptionalFormFields = userTaskDetails.formFields.filter((fields) => !fields.isRequired);
                    campaignOptionalFormFields.forEach(({label}) => {
                        if (!formDataCopy[label]) {
                            formDataCopy[label] = '';
                        }
                    });

                    const formDataKeys = Object.keys(formDataCopy);
                    if (!_.isEqual(formDataKeys.sort(), userTaskDetails.formFields.map((field) => field.label).sort())) {
                        return reply.code(400).send({
                            message: 'Check keys in formData'
                        });
                    }
                    request.body.formData.isPositiveCampaign = userTaskDetails._id + '' === fastify.config.static.campaignId;
                }
            };

            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                const userTaskDetails = await fastify.getUserTask(request.body.campaignId, request.session.user);
                if (!userTaskDetails) {
                    return reply.code(404).send({
                        message: 'campaign not found'
                    });
                }
                await userTaskRequestValidation(userTaskDetails);
                request.body.location.type = 'Point' ;
                request.body.locationNm = (await fastify.getZoneFromLocation(request.body.location.coordinates, 'Point', false)).id;
                // const duplicateRecords = await fastify.findDuplicateLocationData(request.body);
                // if (Array.isArray(duplicateRecords) && duplicateRecords.length) {
                //     return reply.status(200).send({message: 'duplicate location', success: false});
                // }
                const file = (request.body.file || [])[0];
                if (userTaskDetails.needMedia) {
                    if (!file.data) {
                        return reply.code(400).send({ message: 'Media needed'});
                    }
                    const fileKey = `${mongoose.Types.ObjectId()}.${file.filename.split('.').pop()}`;
                    await fastify.awsPlugin.uploadFile(file, fileKey, false);
                    request.body.photoId = fileKey;
                }
                await fastify.insertUserTask(request.session.user, request.body, fastify.config.covidTracker);
                await fastify.updateEntries(request.body.campaignId, true);
                return reply.status(200).send({
                    success: true
                });
            } catch (error) {
                return reply.code(500).send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        });
        fastify.put('/user/device', UserSchema.addDevice, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                const mobileEndpointArn = await fastify.awsPlugin.snsRegistration(request.body.deviceToken);
                await fastify.updateMobileDeviceEndpoint(request.session.user, mobileEndpointArn, request.body.platform);
                return reply.status(200).send({
                    success: true,
                    currentMobileEndpoint: mobileEndpointArn,
                    platform: request.body.platform
                });
            } catch (error) {
                reply.status(500);
                reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        });
        fastify.put('/user/trace', UserSchema.updateLocation, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            if (request.body.inUse) {
                request.body.$currentDate = {
                    lastUsedDateTime: true
                };
            }
            try {
                reply.send({
                    success: true,
                    currentLocation: await fastify.updateLocation(request.session.user, request.body)
                });
            } catch (error) {
                reply.status(500);
                reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        });
        fastify.get('/rewards', {}, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                reply.send({
                    success: true,
                    rewards: await fastify.getRewards()
                });
            } catch (error) {
                reply.status(500);
                reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }

        });
        fastify.get('/images/:imageId', UserSchema.getImage, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            if (!request.session.user.isAdmin && !request.query.isAsset) {
                return reply.status(401).send({ error: 'Unauthorized' });
            }
            try {
                return reply.send(await fastify.awsPlugin.downloadFile(request.params.imageId, request.query.isAsset));
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error: error.message,
                    message: 'error error.message ? error.message : happened'
                });

            }
        });
        fastify.delete('/logout', {} , async (request, reply) => {
            try {
                await request.sessionStore.destroy(`${request.session.sessionId}`, (err) => {
                    if (err) {
                        return reply.send({
                            success: false
                        });
                    } else {
                        delete request.session;
                        return reply.send({
                            success: true
                        });
                    }
                });
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        });
    };
    public setV2PostLoginRoutes = async (fastify) => {
        this.setV1PostLoginRoutes(fastify);
    };
}

export default UserController;
