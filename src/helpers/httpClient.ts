import got from 'got';
import util from 'util';

export default class HttpClient {
    public client;

    constructor(baseUrl?) {
        this.client = got.extend({
            baseURL: baseUrl
        });
    }

    public get(options, context) {
        return this.doHttp('get', options, context);
    }

    public post(options, context, body) {
        return this.doHttp('post', options, context, body);
    }

    public put(options, context, body) {
        return this.doHttp('put', options, context, body);
    }

    public async doHttp(method, options, context, body?) {

        const requestDetails = {
            method,
            url: options.url,
            params: options.params,
            headers: options.headers,
            body
        };
        try {
            const response = await this.client(requestDetails);
            console.info(`API RESPONSE: ${this.createApiLogMessage(requestDetails)}`, this.createApiLogMetadata(requestDetails, response), context);
            return JSON.parse(response.body);
        } catch (err) {
            if (err) {
                err.config = undefined;
                err.request = undefined;
            }
            if (err.response) {
                const metaData = this.createApiLogMetadata(requestDetails, err.response);
                console.error(`API ERROR: ${this.createApiLogMessage(requestDetails)}`, metaData, context);

                if (typeof err.response === 'object') {
                    err.response.config = undefined;
                    err.response.request = undefined;
                }
            } else {
                const metaData = Object.assign(this.createApiLogMetadata(requestDetails, {}), {error: err});
                console.error(`API ERROR: ${this.createApiLogMessage(requestDetails)}`, metaData, context);
            }

            if (err) {
                err.message = `${err.message}; happened for ${requestDetails.method ? requestDetails.method.toUpperCase() : ''} ${requestDetails.url}`;
                err.hasBeenLogged = true;
            }
            const error = err.body ? err.body : err;
            throw new Error(error);
        }
    }

    public createApiLogMessage = (requestDetails) => `${requestDetails.method ? requestDetails.method.toUpperCase() : ''} ${requestDetails.url}`;

    public createApiLogMetadata = (requestDetails, responseDetails) => {
        return {
            subject: 'outgoing api call',
            statusCode: responseDetails.status,
            method: requestDetails.method,
            url: requestDetails.url,
            responseTime: responseDetails.timeTaken,
            requestHeaders: requestDetails.headers ? util.inspect(requestDetails.headers) : undefined,
            responseHeaders: responseDetails.headers ? util.inspect(responseDetails.headers) : undefined,
            params: requestDetails.params ? util.inspect(requestDetails.params) : undefined,
            responseBody: util.inspect(responseDetails.body),
            requestBody: util.inspect(requestDetails.body)
        };
    };
}
