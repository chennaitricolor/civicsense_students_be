import moment from 'moment';
import Admin from '../models/admin';
import AdminCampaign from '../models/admin-campaign';
import Reward from '../models/rewards';
import UserTask from '../models/user-task';

const adminPlugin =  async (fastify, opts, next) => {

    const findAdmin = async (userId) => {
        try {
            return await Admin.findById(userId, '_id');
        } catch (e) {
            throw e;
        }
    };

    const insertCampaign = async (requestData) => {
        try {
            requestData.startDate =  moment(requestData.startDate, 'DD-MM-YYYY');
            requestData.endDate =  moment(requestData.endDate, 'DD-MM-YYYY');
            return await AdminCampaign(requestData).save();
        } catch (e) {
            throw e;
        }
    };

    const updateCampaign = async (data, id) => {
        try {
            data.startDate =  moment(data.startDate, 'DD-MM-YYYY');
            data.endDate =  moment(data.endDate, 'DD-MM-YYYY');
            return await AdminCampaign.findByIdAndUpdate(id, data, {
                new: true
            });
        } catch (e) {
            throw e;
        }
    };

    const deleteCampaign = async (id) => {
        try {
            return await AdminCampaign.findByIdAndUpdate(id, {
                delete: true
            });
        } catch (e) {
            throw e;
        }
    };

    const getReportDetails = async (filterObject) => {
        try {
            const filterQuery: any = {};
            if (filterObject.status) {
                filterQuery.status = filterObject.status;
            }
            if (filterObject.locationNm) {
                filterQuery.locationNm = filterObject.locationNm;
            }
            if (filterObject.userId) {
                filterQuery.userId = filterObject.userId;
            }
            if (filterObject.campaignId) {
                filterQuery.campaignId = filterObject.campaignId;
            }
            if (filterObject.lastRecordCreatedAt) {
                filterQuery.createdAt = {
                    $gt: new Date(filterObject.lastRecordCreatedAt)
                };
            }
            return await AdminCampaign.aggregate([
                {...filterObject.live && {
                    $match: {
                        endDate: {$gte: new Date()},
                        delete: {$ne: true},
                    }
                }},
                {
                    $lookup: {
                        from: 'user.task',
                        let: { campaignId: '$_id' },
                        pipeline: [{
                            $match: {
                                $expr: {$eq: ['$campaignId', '$$campaignId']},
                                ...filterQuery
                            }
                        }],
                        as: 'campaign'
                    },

                }
            ]);

            // UserTask.find(filterQuery)
            //     .populate('campaignId', {
            //         select: 'profile.firstname',
            //         match: { _id: {$ne: user_id}}
            //     })
            // return  UserTask.find({
            //     ...filterQuery
            // }, 'locationNm photoId createdAt status campaignId userId name location').limit(10).sort('createdAt');
        } catch (e) {
            throw e;
        }
    };
    const getLiveCampaigns = async (live) => {
        try {
            const today = new Date();
            return await AdminCampaign.aggregate(
                [{
                    $match: {
                        ...live && {endDate: {$gte: today}},
                        ...live && {delete: {$ne: true}},
                        startDate: {$lte: today}
                    }
                }, {
                    $facet: {
                        campaigns: [
                            {
                                $project: {
                                    campaignName: 1,
                                    noOfEntries: 1,
                                    _id: 1
                                }
                            }
                        ],
                        totalEntries: [
                            {
                                $group: {
                                    _id: '',
                                    count: {
                                        $sum: '$noOfEntries'
                                    }
                                }
                            }, {
                                $project: {
                                    count: 1,
                                    _id: 0
                                }
                            }
                        ]
                    }
                }
                ]
            );
        } catch (e) {
            throw e;
        }
    };
    const getCampaignDetails = async (campaignId, lastRecordCreatedAt) => {
        try {
            const findFilterForpagination = lastRecordCreatedAt ? {
                createdAt: {
                    $gt: new Date(lastRecordCreatedAt)
                }
            } : {};
            return {
                campaignDetails: await AdminCampaign.findById(campaignId, '-createdAt -locationIds -updatedAt'),
                entries: await UserTask.find({
                    campaignId,
                    status: 'SUBMITTED',
                    ...findFilterForpagination
                }, 'locationNm photoId createdAt').limit(10).sort('createdAt')
            };
        } catch (e) {
            throw e;
        }
    };
    const getCampaign = async (campaignId) => {
        try {
            return await AdminCampaign.findById(campaignId, 'rewards');
        } catch (e) {
            throw e;
        }
    };
    const updateTask = async (submissionId, data) => {
        try {
            return await UserTask.findOneAndUpdate({
                _id: submissionId,
                status: 'SUBMITTED'
            }, data, {
                new: true
            });
        } catch (e) {
            throw e;
        }
    };
    const updateEntries = async (campaignId, doIncrement) => {
        try {
            return await AdminCampaign.findOneAndUpdate( { _id: campaignId },
                { $inc: { noOfEntries: doIncrement ? 1 : -1} });
        } catch (e) {
            throw e;
        }
    };
    const addRewards = async (userId, rewards) => {
        try {
            return await new Reward({
                ...rewards,
                createdBy: userId,
                updatedBy: userId
            }).save();
        } catch (e) {
            throw e;
        }
    };

    const editRewards = async (rewardId, userId, rewards) => {
        try {
            return await  Reward.findByIdAndUpdate(rewardId, {
                ...rewards,
                updatedBy: userId
            });
        } catch (e) {
            throw e;
        }
    };
    fastify.decorate('insertCampaign', insertCampaign);
    fastify.decorate('findAdmin', findAdmin);
    fastify.decorate('getLiveCampaigns', getLiveCampaigns);
    fastify.decorate('updateEntries', updateEntries);
    fastify.decorate('getCampaignDetails', getCampaignDetails);
    fastify.decorate('getCampaign', getCampaign);
    fastify.decorate('updateTask', updateTask);
    fastify.decorate('addRewards', addRewards);
    fastify.decorate('editRewards', editRewards);
    fastify.decorate('getReportDetails', getReportDetails);
    fastify.decorate('updateCampaign', updateCampaign);
    fastify.decorate('deleteCampaign', deleteCampaign);
    next();
};
export default adminPlugin;
