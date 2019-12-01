import config from '../config';
const configPlugin =  async (fastify, opts, next) => {
    const configObject = await config;
    fastify.decorate('config', configObject);
    next();
};
export default configPlugin;