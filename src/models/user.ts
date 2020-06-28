import mongoose from 'mongoose';
import location from './location';

const UserSchema = new mongoose.Schema({
    _id : {type: Number, required: true},
    avatar: {type: Number},
    name: {type: String},
    email: {type: String},
    dateOfBirth: {type: Date},
    mobileDeviceEndpoint: {type: String},
    platform: {type: String},
    rewards: {type: Number,  default: 0},
    currentLocation: { type: mongoose.Types.ObjectId, ref: location},
    defaultLocation: { type: mongoose.Types.ObjectId, ref: location},
    lastUsedDateTime: { type: Date },
    gender: {type: String, enum: ['male', 'female', 'other', undefined]},
    region: { type: String, required: true}
}, {
    timestamps: true
});

UserSchema.index({ rewards: -1 });

const User = mongoose.model('User', UserSchema);

export default User;
