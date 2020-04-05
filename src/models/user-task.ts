import mongoose from 'mongoose';
import 'mongoose-geojson-schema';
import Admin from './admin';
import AdminCampaign from './admin-campaign';

const UserTaskSchema = new mongoose.Schema({
    userId: {type: Number, required: true},
    location: mongoose.Schema.Types.Point,
    locationNm: {type: String, required: true},
    campaignId: {type: mongoose.Types.ObjectId, ref: AdminCampaign  },
    status: {type: String, required: true, enum: ['ACCEPTED', 'REJECTED', 'SUBMITTED']},
    validatedBy: {type: Number, ref:  Admin},
    comments: {type: String},
    photoId: {type: String, required: true},
    rewards: {type: Number},
    formData: {type: Object},
}, {
    timestamps: true
});

UserTaskSchema.index({ location: '2dsphere' });

const UserTask = mongoose.model('user.task', UserTaskSchema);

export default UserTask;
