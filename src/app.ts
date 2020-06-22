'use strict';
import redisConnect from 'connect-redis';
import fastifyCompress from 'fastify-compress';
import fastifyCookie from 'fastify-cookie';
import fastifyHelmet from 'fastify-helmet';
import fastifyMultipart from 'fastify-multipart';
import fastifyPlugin from 'fastify-plugin';
import fastifySession from 'fastify-session';
import path from 'path';
import redis from 'redis';
import { PostLoginAdminController, PreLoginAdminController } from './controllers/admin';
import HealthCheck from './controllers/health';
import { PostLoginUserController, PreLoginUserController } from './controllers/user';
import { PreHandlerHook } from './hooks/preHandlerHook';
import adminPlugin from './plugins/admin';
import authenticatorSession from './plugins/authenticator';
import awsPlugin from './plugins/aws';
import config from './plugins/config';
import dbConnectorPlugin from './plugins/dbConnector';
import httpClientPlugin from './plugins/httpClient';
import locationPlugin from './plugins/location';
import metaPlugin from './plugins/meta';
import userPlugin from './plugins/user';
const RedisStore = redisConnect(fastifySession);
export class FastifyPluginRegister  {
    public static fastifyPluginRegister(fastify) {
      const contextPath = '/api/csr';
      const redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: 6379
      });
      this.setRedisEventHandlers(redisClient);

      // fastify plugins
      fastify.register(fastifyCookie);
      fastify.register(fastifySession, {
        cookieName: process.env.COOKIE_NAME,
        secret: process.env.SECRET,
        cookie: { secure: false, maxAge: 90 * 24 * 60 * 60 * 1000},
        store: new RedisStore({
          host: process.env.REDIS_HOST,
          port: 6379,
          client: redisClient
        })
      });
      fastify.register(fastifyHelmet);
      fastify.register(fastifyCompress);
      fastify.register(require('fastify-static'), {
        root: path.join(__dirname, '..', 'static'),
      });

      // custom plugins
      fastify.register(fastifyPlugin(config));
      fastify.register(fastifyPlugin(userPlugin));
      fastify.register(fastifyPlugin(adminPlugin));
      fastify.register(fastifyPlugin(locationPlugin));
      fastify.register(fastifyPlugin(httpClientPlugin));
      fastify.register(fastifyPlugin(authenticatorSession));
      fastify.register(fastifyPlugin(dbConnectorPlugin));
      fastify.register(fastifyPlugin(awsPlugin));
      fastify.register(fastifyPlugin(metaPlugin));

      // service without auth
      fastify.register(HealthCheck, { prefix:  contextPath});
      fastify.register(PreLoginUserController, { prefix:  contextPath});
      fastify.register(PreLoginAdminController, { prefix:  contextPath});

      // services within login
      fastify.register(( instance, opts, next) => {
        // hooks
        PreHandlerHook.authenticationPreHandler(instance);
        this.setMultipartProcessing(instance);
        instance.register(PostLoginUserController, { prefix:  contextPath});
        next();
      });

      // services within login
      fastify.register(( instance, opts, next) => {
        // hooks
        PreHandlerHook.adminAuthenticationPreHandler(instance);
        this.setMultipartProcessing(instance);
        instance.register(PostLoginAdminController, { prefix:  contextPath});

        next();
      });
    }

    private static setRedisEventHandlers(redisClient) {
      redisClient.on('connect', () => {
        console.info('redis connected');
      });
      redisClient.on('error', () => {
        console.error('redis error');
      });
    }

    private static setMultipartProcessing(instance) {
      const options = {
        addToBody: true,
        sharedSchemaId: 'MultipartFileType',
        limit: {
          fileSize: 20,
          files: 1,  }
      };
      instance.register(fastifyMultipart, options);
    }

}
