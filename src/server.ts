'use strict';
import fastifyObj from 'fastify';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { FastifyPluginRegister } from './app';

class ServerInstance {

    public  fastify: fastifyObj.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastifyObj({logger: true});
    public  serverSetup = async () => {
        try {
            await import('make-promises-safe');
            FastifyPluginRegister.fastifyPluginRegister(this.fastify);
            await this.fastify.ready();
            await this.fastify.listen(  this.fastify.config.port || 3000  , '0.0.0.0');
        } catch (err) {
            console.error('Fastify error', err, {});
        }
    };
}
new ServerInstance().serverSetup();
