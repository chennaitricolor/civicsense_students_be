const authenticatorSession = (fastify, opts, next) => {
    fastify.decorate('getSession', async (sessionId) => {
      console.log('session');
    });
    next();
};
export default authenticatorSession;
