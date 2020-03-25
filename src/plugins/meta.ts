import Meta from '../models/meta';

const LocationPlugin = async (fastify, opts, next) => {

    const getLocation = async () => {
        try {
            return await Meta.find({}, '-_id');
        } catch (e) {
            throw e;
        }
    };
    fastify.decorate('getLocation', getLocation);
    next();
};
export default LocationPlugin;
