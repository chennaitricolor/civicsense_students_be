'use strict';
import redisConnect from 'connect-redis';
import { FastifyContext, FastifyInstance } from 'fastify';
import fastifyCompress from 'fastify-compress';
import fastifyCookie from 'fastify-cookie';
import fastifyHelmet from 'fastify-helmet';
import fastifyMultipart from 'fastify-multipart';
import fastifyPlugin from 'fastify-plugin';
import fastifySession from 'fastify-session';
import path from 'path';
import redis from 'redis';
import Constants from './content/root';
import AdminController from './controllers/admin';
import HealthCheck from './controllers/health';
import UserController from './controllers/user';
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
export class FastifyPluginRegister implements FastifyContext  {
    public static fastifyPluginRegister(fastify) {
      const redisClient = redis.createClient({
        host: process.env.REDIS_HOST,
        port: 6379
      });
      const versionPrefix = '/v2';
      this.setRedisEventHandlers(redisClient);

      // fastify plugins
      fastify.register(fastifyCookie);
      fastify.register(fastifySession, {
        cookieName: process.env.COOKIE_NAME,
        secret: 'nkjjbhjbhjbhbhbhjbhjbhjbhjbhjbhjhbjbhjb',
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
      fastify.register(require('fastify-basic-auth'),
      { validate: this.validate});

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

      const v1UserController = new UserController(Constants.versions.ONE);
      const v2UserController = new UserController(Constants.versions.TWO);
      const v1AdminController = new AdminController(Constants.versions.ONE);
      const v2AdminController = new AdminController(Constants.versions.TWO);

      // service without auth
      fastify.register(HealthCheck, { prefix:  this.getContextPath()});
      fastify.register(v1UserController.setPreLoginRoutes(), { prefix:  this.getContextPath()});
      fastify.register(v2UserController.setPreLoginRoutes(), { prefix:  this.getContextPath(versionPrefix)});
      fastify.register(v1AdminController.setPreLoginRoutes(), { prefix:  this.getContextPath()});

      // services within login
      fastify.register(( instance, opts, next) => {
        // hooks
        PreHandlerHook.authenticationPreHandler(instance);
        this.setMultipartProcessing(instance);
        instance.register(v1UserController.setPostLoginRoutes(), { prefix:  this.getContextPath()});
        instance.register(this.getValidatedRoute(v2UserController.setPostLoginRoutes()), { prefix:  this.getContextPath(versionPrefix)});
        next();
      });

      // services within login
      fastify.register(( instance, opts, next) => {
        // hooks
        PreHandlerHook.adminAuthenticationPreHandler(instance);
        this.setMultipartProcessing(instance);
        instance.register(v1AdminController.setPostLoginRoutes(), { prefix:  this.getContextPath()});
        instance.register(v2AdminController.setPostLoginRoutes(), { prefix:  this.getContextPath(versionPrefix)});

        next();
      });
    }

    private static getContextPath(version = '') {
      return `/api${version}/csr`;
    }

    private static validate(username, password, req, reply, done) {

    const me: FastifyContext = this as unknown as FastifyContext;
    if (username === me.config.static.username && password === me.config.static.password ) {
        done();
      } else {
        done({ error: 'Unauthorized' });
      }
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

    private static getValidatedRoute(Routes) {
      return async (fastify) => {
        fastify.after(async () => {
          PreHandlerHook.regionAuthorization(fastify);
          await Routes(fastify);
        });
      };
    }
    public config: any;
}
