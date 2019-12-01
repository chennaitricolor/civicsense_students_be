import HealthSchema from '../schemas/health_schema';
class HealthController  {

    public healthCheck = async (fastify) => {
            fastify.get('/health', HealthSchema , (request, reply) => {
                reply.send({success: 'HealthApi'});
            });
   };
}
export default new HealthController().healthCheck;