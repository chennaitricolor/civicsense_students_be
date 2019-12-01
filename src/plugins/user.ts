import moment from 'moment';
import Admin from '../models/admin';
import AdminCampaign from '../models/admin-campaign';
import User from '../models/user';
import UserTask from '../models/user-task';
import Encryption from '../util/encryption';

enum OTP_TYPES_ENUM {
    SEND_OTP,
    VERIFY_OTP,
    RESEND_OTP,
}

const userPlugin =  async (fastify, opts, next) => {
    const insertUser = async (requestData, isAdmin) => {
        requestData.dateOfBirth =  moment(requestData.dateOfBirth, 'DD-MM-YYYY');
        requestData._id = requestData.userId;
        try {
            if (isAdmin) {
                return await new Admin(requestData).save();
            }
            await new User(requestData).save();
        } catch (e) {
            throw e;
        }
    };
    const userIdAvailability = async (userId, exists) => {
        try {
            if (exists) {
                return await User.findById(userId, '_id');
            } else {
                return await User.findById(userId, 'name phoneNumber email dateOfBirth avatar gender defaultLocation');
            }
        } catch (e) {
            throw e;
        }
    };
    const findUserIdByEmail = async (email) => {
        try {
            return await User.findOne({ email }, '_id');
        } catch (e) {
            throw e;
        }
    };
    const login = async (requestData, isAdmin) => {
        try {
            let userRecord;
            if (isAdmin) {
                userRecord = await Admin.findById(requestData.userId, 'password');
            } else {
                userRecord = await User.findById(requestData.userId, 'password');
            }
            if (!userRecord) {
                return false;
            }
            return await Encryption.compare(requestData.password, userRecord.password);
        } catch (e) {
            throw e;
        }
    };

    const updatePassword = async ( userId, password, isAdmin ) => {
        try {
            if (isAdmin) {
                return await Admin.findOneAndUpdate({_id: userId} , {$set: {password}}, { new: true});
            } else {
                return await User.findOneAndUpdate({_id: userId} , {$set: {password}}, { new: true});
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

    const insertUserTask = async (userId, data) => {
        try {
            data.userId = userId;
            data.status = 'SUBMITTED';
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
                                    $geometry: { type: 'Point',  coordinates: data.location.coordinates },
                                    $maxDistance: 100
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
    const updateLocation = async (userId, data) => {
        try {
            data.currentLocation = await fastify.getZoneFromLocation(data.currentLocation.coordinates, 'Point');
            if (data.inUse) {
                await User.findByIdAndUpdate(userId, data);
                return data.currentLocation;
            }
            else if (data.pastLocation !== data.currentLocation.toString()) {
                delete data.pastLocation;
                await User.findByIdAndUpdate(userId, data);
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
    const updateMobileDeviceEndpoint = async (userId, mobileDeviceEndpoint, platform) => {
        try {
            return await User.findByIdAndUpdate(userId, {
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
    const getUserTasks = async (userId, coordinates) => {
        try {
            let currentLocation;
            if (!coordinates) {
                currentLocation = (await User.findById(userId, 'currentLocation')).currentLocation;
            } else {
                currentLocation = await fastify.getZoneFromLocation(coordinates, 'Point');
                await User.findByIdAndUpdate(userId, {
                    currentLocation
                });
            }
            return await AdminCampaign.find({
                endDate: {
                    $gte: new Date(),
                },
                locationIds: currentLocation
            }, 'startDate endDate campaignName description rewards');
        } catch (e) {
            throw e;
        }
    };

    const getUserTask = async (taskId) => {
        try {
            return await AdminCampaign.findById(taskId, 'startDate endDate campaignName description rewards rules');
        } catch (e) {
            throw e;
        }
    };

    const getLeaderboard = async (userId, type) => {
        try {
            const filter = type === 'local' ?  [{
                $match: {
                    defaultLocation: (await userIdAvailability(userId, false)).defaultLocation
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
                userRank: userRank ? userRank + 1 : -1
            };
        } catch (e) {
            throw e;
        }
    };
    fastify.decorate('insertUser', insertUser);
    fastify.decorate('login', login);
    fastify.decorate('userIdAvailability', userIdAvailability);
    fastify.decorate('findUserIdByEmail', findUserIdByEmail);
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
    fastify.decorate('getLeaderboard', getLeaderboard);
    next();
};
export default userPlugin;
