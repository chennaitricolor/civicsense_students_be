'use strict';
import mongoose from 'mongoose';
import UserSchema from '../schemas/user';
class UserController {
    public setPreLoginUserRoutes = async (fastify) => {
        fastify.get('/users/:userId/availability', UserSchema.availability , async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                return reply.send({
                    success: !await fastify.userIdAvailability(request.params.userId, true)
                });
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        });
        fastify.post('/user', UserSchema.post , async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                request.body.currentLocation = await fastify.getZoneFromLocation(request.body.currentLocation.coordinates, 'Point');
                request.body.defaultLocation = request.body.currentLocation;
                // add email verification
                if (request.body.phoneNumber && !await  fastify.verifyMobileOTP(request.body.phoneNumber, request.body.otp)) {
                    return reply.send({
                        success: false
                    });
                }
                request.body.lastUsedDateTime = Date.now();
                await fastify.insertUser(request.body, false);
                request.session.user = {
                    userId: request.body.userId
                };
                // save sessionId in redis
                return reply.send({
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
        fastify.get('/users/forgot-user-id', UserSchema.forgotUserId , async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                const userData = await fastify.findUserIdByEmail(request.query.email);
                if (userData) {
                    return reply.send({
                            userId: userData._id
                        });
                }
                return reply
                    .status(404)
                    .send();
            } catch (error) {
                reply.status(500);
                return reply.send({
                    error,
                    message: error.message ? error.message : 'error happened'

                });

            }
        });
        fastify.get('/user/generate-otp', UserSchema.generateOTP, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {

                const { phoneNumber, email} = request.query;
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
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                if (await fastify.login(request.body)) {
                    request.session.user = {
                        userId: request.body.userId
                    };
                    await fastify.updateUsedDateTime(request.body.userId);
                    // save sessionId in redis
                    return reply.send({
                        success: true
                    });
                }
                return reply.send({
                    success: false
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
    public setPostLoginUserRoutes = async (fastify) => {
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

                const { phoneNumber, email} = request.body.newValues;
                const { mobileOtp, emailOtp} = request.body.otp;
                if (phoneNumber) {
                    await fastify.verifyMobileOTP(phoneNumber, mobileOtp);
                }
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
        fastify.put('/user/change-password', UserSchema.changePassword, async (request, reply) => {
            if (request.validationError) {
                return reply.code(400).send(request.validationError);
            }
            try {
                await fastify.updatePassword(request.session.user.userId, request.body.password, request.session.user.isAdmin);
                await request.sessionStore.destroy(`${request.session.sessionId}`, (err) => {
                    request.session = undefined;
                    reply.send({
                        success: true
                    });
                });
            } catch (error) {
                reply.status(500);
                reply.send({
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
                    tasks: await fastify.getUserTasks(request.session.user.userId, request.query.coordinates)
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
                    task: await fastify.getUserTask(request.params.taskId)
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
            const file = request.body.file[0];
            if (request.validationError && !file.data) {
                return reply.code(400).send(request.validationError);
            }
            try {
                request.body.location.type = 'Point' ;

                const duplicateRecords = await fastify.findDuplicateLocationData(request.body);
                if (Array.isArray(duplicateRecords) && duplicateRecords.length) {
                    return reply.status(200).send({message: 'duplicate location', success: false});
                }
                const fileKey = `${mongoose.Types.ObjectId()}.${file.filename.split('.').pop()}`;
                await fastify.awsPlugin.uploadFile(file, fileKey, false);
                request.body.photoId = fileKey;
                await fastify.insertUserTask(request.session.user.userId, request.body);
                await fastify.updateEntries(request.body.campaignId);
                return reply.status(200).send({
                    success: true
                });
            } catch (error) {
                reply.status(500);
                reply.send({
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
                await fastify.updateMobileDeviceEndpoint(request.session.user.userId, mobileEndpointArn, request.body.platform);
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
                    currentLocation: await fastify.updateLocation(request.session.user.userId, request.body)
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
                    error: error .message,
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
                        request.session = undefined;
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
}

export const PreLoginUserController = new UserController().setPreLoginUserRoutes;
export const PostLoginUserController = new UserController().setPostLoginUserRoutes;
