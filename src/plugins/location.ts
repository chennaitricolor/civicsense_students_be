import Location from '../models/location';

const LocationPlugin = async (fastify, opts, next) => {
    const insertLocation = async (requestData) => {
        try {
            return await new Location(requestData).save();
        } catch (e) {
            throw e;
        }
    };

    const getLocation = async () => {
        try {
            return await Location.find({}, 'locationNm state country');
        } catch (e) {
            throw e;
        }
    };

    const getZoneFromLocation = async (coordinates, type) => {
        try {
            const zoneArray = await Location.find({
                location: {
                    $geoIntersects: {
                        $geometry: {
                            type,
                            coordinates
                        }
                    }
                }
            });
            if (zoneArray[0]) {
                return zoneArray[0]._id;
            } else {
                throw new Error('App not supported in this location');
            }
        } catch (e) {
            throw e;
        }

    };

    fastify.decorate('insertLocation', insertLocation);
    fastify.decorate('getLocation', getLocation);
    fastify.decorate('getZoneFromLocation', getZoneFromLocation);
    next();
};
export default LocationPlugin;
