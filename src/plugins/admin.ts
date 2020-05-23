import moment from 'moment';
import mongoose from 'mongoose';
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
            filterObject.live =  filterObject.live ? filterObject.live === 'true' : false;
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
                filterQuery.campaignId = mongoose.Types.ObjectId(filterObject.campaignId);
            }
            if (filterObject.lastRecordCreatedAt) {
                filterQuery.createdAt = {
                    $gt: new Date(filterObject.lastRecordCreatedAt)
                };
            }
            const redactIf = filterObject.live ? {
                $and: [{
                    $gte: ['$campaign.endDate', new Date()]
                }, {
                    $ne: ['$campaign.delete', true]
                }]
            } : true ;
            return await getReport(filterQuery, redactIf, filterObject.limit);
        } catch (e) {
            throw e;
        }
    };

    const getPositiveReportDetails = async (filterObject) => {
        try {
            filterObject.live =  filterObject.live ? filterObject.live === 'true' : false;
            const filterQuery: any = {};
            filterQuery.campaignId = mongoose.Types.ObjectId(filterObject.campaignId ? filterObject.campaignId : fastify.config.static.campaignId);
            if (filterObject.status) {
                filterQuery.status = filterObject.status;
            }
            if (filterObject.locationNm) {
                filterQuery.locationNm = filterObject.locationNm;
            }
            if (filterObject.userId) {
                filterQuery.userId = filterObject.userId;
            }
            if (filterObject.lastRecordCreatedAt) {
                filterQuery.createdAt = {
                    $gt: new Date(filterObject.lastRecordCreatedAt)
                };
            }
            if (filterObject.endDate) {
                filterQuery.createdAt ? filterQuery.createdAt.$lte = new Date(filterObject.endDate) :
                filterQuery.createdAt = {
                    $lte: new Date(filterObject.endDate)
                };
            }
            const redactIf = filterObject.live ? {
                $and: [{
                    $gte: ['$campaign.endDate', new Date()]
                }, {
                    $ne: ['$campaign.delete', true]
                }]
            } : true ;
            return await getReport(filterQuery, redactIf, filterObject.limit);
        } catch (e) {
            throw e;
        }
    };

    const getReport = async (filterQuery, redactIf, limit) => {
        const aggregatePipeline: any = [
            { $match: filterQuery },
            { $lookup: {
                    from: 'admin.campaigns',
                    localField: 'campaignId',
                    foreignField: '_id',
                    as: 'campaign'
                }},
            { $unwind: '$campaign' },
            { $redact: {
                    $cond : {
                        if: redactIf,
                        then: '$$KEEP',
                        else: '$$PRUNE'
                    }
                }
            },
            { $sort : { createdAt : 1 } }
        ];
        if (limit) {
            limit = parseInt(limit, 10) || limit;
            aggregatePipeline.splice(-1, 0, { $limit: limit });
        }
        return await UserTask.aggregate(aggregatePipeline);
    };
    const getLiveCampaigns = async (live) => {
        live =  live ? live === 'true' : false;
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
    fastify.decorate('getPositiveReportDetails', getPositiveReportDetails);
    fastify.decorate('updateCampaign', updateCampaign);
    fastify.decorate('deleteCampaign', deleteCampaign);
    next();
};
export default adminPlugin;
