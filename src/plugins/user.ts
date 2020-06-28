import Admin from '../models/admin';
import AdminCampaign from '../models/admin-campaign';
import Reward from '../models/rewards';
import User from '../models/user';
import UserTask from '../models/user-task';
import { validations } from '../util/validators';
import { validator } from './../util/helper';

enum OTP_TYPES_ENUM {
    SEND_OTP,
    VERIFY_OTP,
    RESEND_OTP,
}

const userPlugin =  async (fastify, opts, next) => {
    const insertUser = async (requestData, isAdmin) => {
    const { lastUsedDateTime, ...dataObject} = requestData;
    dataObject._id = dataObject.userId;
    try {
            if (isAdmin) {
                return await Admin.update(
                    {_id: dataObject._id},
                    { $set: {
                            lastUsedDateTime
                        },
                        $setOnInsert: dataObject ,
                    },
                    { upsert: true }
                );
            }
            return await User.update(
                {_id: dataObject._id},

                { $set: {
                        lastUsedDateTime
                    },
                     $setOnInsert: dataObject ,
                },
                { upsert: true }
            );
        } catch (e) {
            throw e;
        }
    };
    const userIdAvailability = async (userId, exists) => {
        try {
            if (exists) {
                return await User.findById(userId, '_id');
            } else {
                return await User.findById(userId, 'name phoneNumber email dateOfBirth avatar gender defaultLocation rewards');
            }
        } catch (e) {
            throw e;
        }
    };

    const updatePassword = async ( filterBy, password, isAdmin ) => {
        try {
            if (isAdmin) {
                return await Admin.findOneAndUpdate(filterBy , {$set: {password}}, { new: true});
            } else {
                return await User.findOneAndUpdate(filterBy , {$set: {password}}, { new: true});
            }
        } catch (e) {
            throw e;
        }
    };

    const updateProfile = async (userId, data) => {
        try {
            return await User.findByIdAndUpdate(userId, data);
        } catch (e) {
            throw e;
        }
    };

    const updateRewards = async (userId, rewards) => {
        try {
            return await User.findByIdAndUpdate(userId, {$inc: {rewards}});
        } catch (e) {
            throw e;
        }
    };

    const insertUserTask = async ({userId, region, persona}, formData, covidTracker) => {
        try {
            const getIndicator = (dataVal) => {
                const indicatorCalculator = (validationResult: { [s: string]: boolean; }) => Object.values(validationResult).reduce((a, b) => a && b);
                return !validator(dataVal, validations.isPositiveCaseValidators, indicatorCalculator).result;
            };
            const { ...data} = formData;
            const isPositiveCampaign = formData &&  formData.formData && formData.formData.isPositiveCampaign;
            data.submittedBy = {
                userId,
                region,
                persona
            };
            if (isPositiveCampaign) {
                const indicator = getIndicator(data.formData);
                data.formData.indicator = indicator ? 'RED' : 'GREEN';
                data.status = indicator ? 'OPEN' : 'CLOSED';
            } else {
                data.status =  covidTracker === 'true' ? 'ACCEPTED' : 'SUBMITTED';
                console.log('status', data.status);
            }
            if (data.formData) {
                delete data.formData.isPositiveCampaign;
            }
            return await UserTask(data).save();
        } catch (e) {
            throw e;
        }
    };

    const findDuplicateLocationData = async (data) => {
        try {
            return await UserTask.find(
                {
                    location:
                        { $near :
                                {
                                    $geometry: { type: 'Point',  coordinates: data.location.coordinates }
                                }
                        },
                    campaignId: data.campaignId
                }
            );
        } catch (e) {
            throw e;
        }
    };
    const makeMobileOTPurl = (type: OTP_TYPES_ENUM, mobile, otp?) => {
        const {
            expiry,
            length,
            templateId,
            authKey,
            invisible,
            baseUrl
        } = fastify.config.otp.mobile;
        switch (type) {
            case OTP_TYPES_ENUM.SEND_OTP:
                return `${baseUrl}?otp_expiry=${expiry}&otp_length=${length}&template_id=${templateId}&mobile=${mobile}&authkey=${authKey}&invisible=${invisible}`;
            case OTP_TYPES_ENUM.VERIFY_OTP:
                return `${baseUrl}/verify?otp=${otp}&mobile=${mobile}&authkey=${authKey}`;
            case OTP_TYPES_ENUM.RESEND_OTP:
                return `${baseUrl}/retry?mobile=${mobile}&authkey=${authKey}`;
        }
    };

    const generateMobileOTP = async (mobile) => {
        try {
            const options = {
                url: makeMobileOTPurl(OTP_TYPES_ENUM.SEND_OTP, mobile ),
                headers: {
                    'content-type': 'application/json'
                }
            };
            const { type } = await fastify.httpClient.post(options) || {};
            return type === 'success';
        } catch (e) {
            throw e;
        }
    };

    const verifyMobileOTP = async (mobile, otp) => {
        try {
            const options = {
                url: makeMobileOTPurl(OTP_TYPES_ENUM.VERIFY_OTP, mobile, otp),
                headers: {
                    'content-type': 'application/json'
                }
            };
            const { type } = await fastify.httpClient.post(options) || {};
            return type === 'success';
        } catch (e) {
            throw e;
        }
    };
    const resendMobileOTP = async (mobile) => {
        try {
            const options = {
                url: makeMobileOTPurl(OTP_TYPES_ENUM.RESEND_OTP, mobile ),
                headers: {
                    'content-type': 'application/json'
                }
            };
            const { type } = await fastify.httpClient.post(options) || {};
            return type === 'success';
        } catch (e) {
            throw e;
        }
    };
    const updateLocation = async ({ userId, region }, data) => {
        try {
            data.currentLocation = (await fastify.getZoneFromLocation(data.currentLocation.coordinates, 'Point')).id;
            if (data.inUse) {
                await User.findOneAndUpdate({ _id: userId, region }, data);
                return data.currentLocation;
            }
            else if (data.pastLocation !== data.currentLocation.toString()) {
                delete data.pastLocation;
                await User.findOneAndUpdate({ _id: userId, region }, data);
                return data.currentLocation;
            } else {
                return data.pastLocation;
            }
        } catch (e) {
            throw e;
        }
    };
    const updateUsedDateTime = async (userId) => {
        try {
            return await User.findByIdAndUpdate(userId, {
                 $currentDate: {
                     lastUsedDateTime: true
                 }
            });
        } catch (e) {
            throw e;
        }
    };
    const updateMobileDeviceEndpoint = async ({ userId, region }, mobileDeviceEndpoint, platform) => {
        try {
            return await User.findOneAndUpdate({ _id: userId, region }, {
                $set: {
                    mobileDeviceEndpoint, platform
                }
            });
        } catch (e) {
            throw e;
        }
    };
    const findLocationBasedUserData = async (locationIds) => {
        try {
            return await User.find({currentLocation: locationIds});
        } catch (e) {
            throw e;
        }
    };
    const getUserTasks = async ({userId, region, persona}, coordinates) => {
        try {
            const zoneArrayVal: any[] = [];
            if (!coordinates) {
                zoneArrayVal.push((await User.findOneAndUpdate({ _id: userId, region }, 'currentLocation')).currentLocation);
            } else {
               const { currentLocation, zoneArray } = await fastify.getZoneFromLocation(coordinates, 'Point');
               await User.findByIdAndUpdate({ _id: userId, region }, {
                    currentLocation
                });
               zoneArrayVal.push(...zoneArray.map((a) => a._id));
            }
            return await AdminCampaign.find({
                endDate: {
                    $gte: new Date(),
                },
                startDate: {
                    $lte: new Date(),
                },
                region: {
                    $eq: region,
                },
                persona: {
                    $eq: persona,
                },
                delete: {
                    $ne: true
                },
                locationIds: {
                    $in: zoneArrayVal
                }
            }, 'startDate endDate campaignName rules description rewards');
        } catch (e) {
            throw e;
        }
    };

    const getUserTask = async (taskId, { region, persona}) => {
        try {
            return await AdminCampaign.find({ _id: taskId, region, persona }, 'startDate endDate campaignName description rewards rules needForm formFields');
        } catch (e) {
            throw e;
        }
    };

    const getRewards = async () => {
        try {
            const today = new Date();
            return await Reward.aggregate([{
                $match: {
                    validTill: {$gte: today},
                    validFrom: {$lte: today}
                }
            }, {
                $project: {
                    title: 1,
                    description: 1,
                    gems: 1,
                    photoId: 1,
                    validTill: 1,
                }

            }]);
        } catch (e) {
            throw e;
        }
    };

    const getLeaderboard = async (userId, type) => {
        try {
            const findUser = await userIdAvailability(userId, false);
            const filter = type === 'local' ?  [{
                $match: {
                    defaultLocation: findUser.defaultLocation
                }
            }] : [];
            const leaderboard = await User.aggregate([...filter, {
                $sort: {
                    rewards: -1
                },
            }, {
                $limit: 10
            }, {
                $project: {
                    _id: -1,
                    name: 1,
                    rewards: 1,
                    avatar: 1,
                }
            }]);
            let userRank = leaderboard.findIndex((user) => user._id === userId);
            if (userRank === -1) {
                const userRankArray = await User.aggregate([ ...filter, {
                    $sort: {
                        rewards: -1
                    },
                }, {
                    $group: {
                        _id: false,
                        users: {
                            $push: {
                                _id: '$_id',
                                avatar: 'avatar',
                                name: 'name',
                                rewards: '$rewards'
                            }
                        }
                    }
                }, {
                    $unwind: {
                        path: '$users',
                        includeArrayIndex: 'ranking'
                    }
                }, {
                    $match: {
                        'users._id': userId
                    }
                }, {
                    $project: {
                        ranking: 1,
                    }
                }]);
                userRank = (userRankArray[0] || {}).ranking;
            }

            return {
                leaderboard,
                userRank: !isNaN(userRank)  ? userRank + 1 : -1,
                userRewards: findUser.rewards
            };
        } catch (e) {
            throw e;
        }
    };
    fastify.decorate('insertUser', insertUser);
    fastify.decorate('userIdAvailability', userIdAvailability);
    fastify.decorate('updateProfile', updateProfile);
    fastify.decorate('generateMobileOTP', generateMobileOTP);
    fastify.decorate('verifyMobileOTP', verifyMobileOTP);
    fastify.decorate('resendMobileOTP', resendMobileOTP);
    fastify.decorate('updatePassword', updatePassword);
    fastify.decorate('updateLocation', updateLocation);
    fastify.decorate('updateUsedDateTime', updateUsedDateTime);
    fastify.decorate('insertUserTask', insertUserTask);
    fastify.decorate('getUserTasks', getUserTasks);
    fastify.decorate('getUserTask', getUserTask);
    fastify.decorate('findDuplicateLocationData', findDuplicateLocationData);
    fastify.decorate('updateMobileDeviceEndpoint', updateMobileDeviceEndpoint);
    fastify.decorate('findLocationBasedUserData', findLocationBasedUserData);
    fastify.decorate('updateRewards', updateRewards);
    fastify.decorate('getRewards', getRewards);
    fastify.decorate('getLeaderboard', getLeaderboard);
    next();
};
export default userPlugin;
