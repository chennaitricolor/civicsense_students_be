'use strict';
import Constants from '../content/root';
const noImplementation = () => {
    throw new Error(('Method not implemented'));
};

class BaseController {
    public version: any;
    public routes: any;
    public routeMap: any;
    constructor(version) {
        if (this.constructor === BaseController) {
            throw new Error((`Cant't instantiate a base abstract class`));
        }
        this.version = version;
    }
    public setPreLoginRoutes() {
        return this._setRoutes(Constants.methods.PRE_LOGIN);
    }

    public setPostLoginRoutes() {
        return this._setRoutes(Constants.methods.POST_LOGIN);
    }
    public setV1PreLoginRoutes(fastify) {
        noImplementation();
    }
    public setV2PreLoginRoutes(fastify) {
        noImplementation();
    }
    public setV2PostLoginRoutes(fastify) {
        noImplementation();
    }
    public setV1PostLoginRoutes(fastify) {
        noImplementation();
    }

    public _setRoutes(method) {
        const routeMap = {
            [Constants.versions.ONE]: {
                [Constants.methods.PRE_LOGIN]: this.setV1PreLoginRoutes,
                [Constants.methods.POST_LOGIN]: this.setV1PostLoginRoutes,
            },
            [Constants.versions.TWO]: {
                [Constants.methods.PRE_LOGIN]: this.setV2PreLoginRoutes,
                [Constants.methods.POST_LOGIN]: this.setV2PostLoginRoutes,
            },
        };
        return routeMap[this.version][method];
    }
}

export default BaseController;