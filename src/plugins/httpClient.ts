import HttpClient from '../helpers/httpClient';
const httpClientPlugin =  async (fastify, opts, next) => {
    const httpClient = new HttpClient();
    fastify.decorate('httpClient', httpClient);
    next();
};
export default httpClientPlugin;
