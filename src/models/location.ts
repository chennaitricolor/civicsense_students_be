/* tslint:disable:ordered-imports */
import 'mongoose-geojson-schema';
import mongoose from 'mongoose';
import admin from './admin';

const LocationSchema = new mongoose.Schema({
    locationNm: { type: String, required: true },
    state: {type: String, required: true},
    country: {type: String, required: true},
    createdBy: {type: String, ref: admin},
    location: mongoose.Schema.Types.MultiPolygon,
    region: {type: String}
}, {
    timestamps: true
});

LocationSchema.index({ location: '2dsphere' });

const Location = mongoose.model('location', LocationSchema);

export default Location;
