export class PreHandlerHook {

    public static authenticationPreHandler(fastify) {
        fastify.addHook('preHandler',  (request, reply, next) => {
                if (!request.session.user) {
                    return reply.status(401).send({ error: 'Unauthorized' });
                } else {
                    next();
                }

        });
    }

    public static regionAuthorization(fastify) {
        fastify.addHook('preHandler',  (request, reply, next) => {
                console.log(request.session);
                if (request.session.user && request.session.user.region === request.headers.region) {
                    next();
                } else {
                    return reply.status(401).send({ error: 'Unauthorized' });
                }

        });
    }

    public static adminAuthenticationPreHandler(fastify) {
        fastify.addHook('preHandler',  (request, reply, next) => {
            if (!request.session.user || !request.session.user.isAdmin) {
                return reply.status(401).send({ error: 'Unauthorized' });
            } else {
                next();
            }

        });
    }
}
