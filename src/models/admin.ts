import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
    _id : {type: Number, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true, index: true},
    dateOfBirth: {type: Date, required: true},
    region: {type: String, required: true},
    persona: {type: String, required: true},
    gender: {type: String, enum: ['male', 'female', 'other', undefined]},

}, {
    timestamps: true
});

const Admin = mongoose.model('admin', AdminSchema);

export default Admin;
