import mongoose from 'mongoose';
import admin from './admin';

const AdminCampaignSchema = new mongoose.Schema({
    campaignName: { type: String, required: true },
    description:  { type: String, required: true},
    rules:  { type: String, required: true},
    startDate: {type: Date, required: true},
    endDate: {type: Date, required: true},
    rewards:  { type: Number, required: true },
    locationIds: [mongoose.Types.ObjectId],
    noOfEntries: {type: Number, default: 0},
    createdBy: { type: Number, ref: admin},
    delete: {type: Boolean},
}, {
    timestamps: true
});

const AdminCampaign = mongoose.model('admin.campaign', AdminCampaignSchema);

export default AdminCampaign;
