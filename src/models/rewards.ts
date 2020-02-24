import mongoose from 'mongoose';
import admin from './admin';

const RewardsSchema = new mongoose.Schema({
    title: {type: String, required: true},
    gems: {type: Number, required: true},
    description: {type: String, required: true},
    photoId: {type: String, required: true},
    validFrom: {type: Date, required: true},
    validTill: {type: Date, required: true},
    createdBy: { type: Number, ref: admin},
    updatedBy: { type: Number, ref: admin}
}, {
    timestamps: true
});

const Reward = mongoose.model('reward', RewardsSchema);

export default Reward;
