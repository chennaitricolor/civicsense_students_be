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

    const getZoneFromLocation = async (coordinates, type, zoneid= true) => {
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
                if (zoneid) {
                    return zoneArray[0]._id;
                } else {
                    return zoneArray[0].locationNm;
                }

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
