import mongoose from 'mongoose';
import Encryption from '../util/encryption';
import location from './location';

export interface IUser extends mongoose.Document {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: number;
    email: string;
    dateOfBirth: Date;
    password: string;
    mobileDeviceEndpoint: string;
    platform: string;
    location: string;
}

const UserSchema = new mongoose.Schema({
    _id : {type: String, required: true},
    avatar: {type: Number, required: true},
    name: {type: String, required: true},
    phoneNumber: {type: Number},
    email: {type: String, required: true, index: true},
    dateOfBirth: {type: Date, required: true},
    password: {type: String, required: true},
    mobileDeviceEndpoint: {type: String},
    platform: {type: String},
    rewards: {type: Number},
    currentLocation: { type: mongoose.Types.ObjectId, ref: location},
    defaultLocation: { type: mongoose.Types.ObjectId, ref: location},
    lastUsedDateTime: { type: Date },
    gender: {type: String, enum: ['male', 'female', 'other', undefined]},
}, {
    timestamps: true
});

UserSchema.index({ rewards: -1 });

UserSchema.pre<IUser>('save', function(this: IUser, next)  {
    Encryption.hashPassword(this.password, 12, (err, hash) => {
        if (err) {
            throw err;
        } else {
            this.password = hash;
            next();
        }
    });
});
UserSchema.pre<IUser>(['updateOne', 'findOneAndUpdate'], function(this: mongoose.Query, next) {
    const updateObject = this._update;
    const changeObject = this.op === 'updateOne' ? updateObject : this.op === 'findOneAndUpdate' ? updateObject.$set : undefined;
    changeObject.password ? Encryption.hashPassword(this._update.$set.password, 12, (err, hash) => {
        if (err) {
            throw err;
        } else {
            this.update({}, { password: hash});
            next();
        }
    }) : next();

});
const User = mongoose.model('User', UserSchema);

export default User;
