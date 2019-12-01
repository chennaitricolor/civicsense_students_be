import DbConnector from '../util/dbConnector';
const dbConnectorPlugin =  async (fastify, opts, next) => {
    const dbConnector = new DbConnector(fastify.config);
    fastify.decorate('dbConnector', dbConnector);
    next();
};
export default dbConnectorPlugin;
