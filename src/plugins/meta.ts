import Meta from '../models/meta';

const MetaPlugin = async (fastify, opts, next) => {

    const getStatic = async (revision = 1) => {
        try {
            return await Meta.findOne({ revision }, '-_id');
        } catch (e) {
            throw e;
        }
    };

    const putStatic = async (data) => {
        try {
            return await Meta.findOneAndUpdate({}, data, { new: true} );
        } catch (e) {
            throw e;
        }
    };
    fastify.decorate('getStatic', getStatic);
    fastify.decorate('putStatic', putStatic);
    next();
};
export default MetaPlugin;
