import mongoose from 'mongoose';
import Encryption from '../util/encryption';

export interface IAdmin extends mongoose.Document {
    password: string;
}

const AdminSchema = new mongoose.Schema({
    _id : {type: String, required: true},
    name: {type: String, required: true},
    phoneNumber: {type: Number},
    email: {type: String, required: true, index: true},
    dateOfBirth: {type: Date, required: true},
    password: {type: String, required: true},
    gender: {type: String, enum: ['male', 'female', 'other', undefined]},

}, {
    timestamps: true
});

AdminSchema.pre<IAdmin>('save', function(this: IAdmin, next)  {
    Encryption.hashPassword(this.password, 12, (err, hash) => {
        if (err) {
            throw err;
        } else {
            this.password = hash;
            next();
        }
    });
});

const Admin = mongoose.model('admin', AdminSchema);

export default Admin;
