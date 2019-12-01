import moment from 'moment';
import AdminCampaign from '../models/admin-campaign';
import UserTaskSchema from '../models/user-task';

const adminPlugin =  async (fastify, opts, next) => {
    const insertCampaign = async (requestData) => {
        try {
            requestData.startDate =  moment(requestData.startDate, 'DD-MM-YYYY');
            requestData.endDate =  moment(requestData.endDate, 'DD-MM-YYYY');
            return await AdminCampaign(requestData).save();
        } catch (e) {
            throw e;
        }
    };
    const getLiveCampaigns = async () => {
        try {
            const today = new Date();
            return await AdminCampaign.aggregate(
                [{
                    $match: {
                        endDate: {$gte: today}
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
                entries: await UserTaskSchema.find({
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
            return await UserTaskSchema.findOneAndUpdate({
                _id: submissionId,
                status: 'SUBMITTED'
            }, data, {
                new: true
            });
        } catch (e) {
            throw e;
        }
    };
    const updateEntries = async (campaignId) => {
        try {
            return await AdminCampaign.findOneAndUpdate( { _id: campaignId },
                { $inc: { noOfEntries: 1} });
        } catch (e) {
            throw e;
        }
    };

    fastify.decorate('insertCampaign', insertCampaign);
    fastify.decorate('getLiveCampaigns', getLiveCampaigns);
    fastify.decorate('updateEntries', updateEntries);
    fastify.decorate('getCampaignDetails', getCampaignDetails);
    fastify.decorate('getCampaign', getCampaign);
    fastify.decorate('updateTask', updateTask);
    next();
};
export default adminPlugin;
