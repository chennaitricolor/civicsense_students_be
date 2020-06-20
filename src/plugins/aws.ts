import stream from 'stream';
import AwsConnector from '../util/awsConnector';

class AWSPlugin {

    private static payload(platform, payload) {
        switch (platform) {
            case 'APNS':
                 payload = JSON.stringify(  {
                        aps: {
                            alert: { body: payload.message, title: payload.title},
                            navigation: 'task-page',
                            messageId: payload.messageId
                            }
                        });
                 return JSON.stringify({APNS: payload});
            case 'FCM':
                payload = JSON.stringify({
                    data: {
                        title : payload.title,
                        body  :  payload.message,
                        messageId: payload.messageId,
                        navigation: 'task-page'
                    }
                });
                return JSON.stringify({GCM: payload});
            default:
                return payload;
        }

    }
    private config: any;

    constructor(config) {
        this.config = config;
    }

    public uploadFile(file, Key, isAsset) {
        return new Promise(((resolve, reject) => {
                const params = {
                    Bucket: isAsset ? this.config.s3.assetBucketName : this.config.s3.taskBucketName,
                    Key,
                    Body: file.data
                };
                AwsConnector.getS3ClientConnection(this.config).upload(params, (err, data) => {
                    if (err) {
                        console.log('There was an error uploading your file: ', err);
                        return reject(err);
                    }
                    console.log('Successfully uploaded file.', data);
                    return resolve(data);
                });
            }
        ));
    }
    public uploadFromStream(Key, isAsset, promise) {
        const pass = new stream.PassThrough();
        const params = {
            Bucket: isAsset ? this.config.s3.assetBucketName : this.config.s3.taskBucketName,
            Key,
            Body: pass
        };
        AwsConnector.getS3ClientConnection(this.config).upload(params, (err, data) => {
            if (err) {
                console.log('There was an error uploading your file: ', err);
                return promise.reject(err);
            }
            console.log('Successfully uploaded file.', data);
            return promise.resolve(data);
        });
        return pass;
    }

    public downloadFile(Key, isAsset) {
        try {
            const params = {
                Bucket: isAsset ? this.config.s3.assetBucketName : this.config.s3.taskBucketName,
                Key,
            };
            return AwsConnector.getS3ClientConnection(this.config).getObject(params).createReadStream();
        } catch (e) {
            throw e;
        }
    }

    public snsRegistration(deviceToken) {
        return new Promise(((resolve, reject) => {
                AwsConnector.getSNSClientConnection(this.config).createPlatformEndpoint({
                    PlatformApplicationArn: this.config.sns.applicationArn,
                    Token: deviceToken
                }, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(data ? data.EndpointArn : '');
                });
            }
        ));
    }

    public snsSendNotification(userData, payload) {
        return new Promise(((resolve, reject) => {
                AwsConnector.getSNSClientConnection(this.config).publish({
                    TargetArn: userData.mobileDeviceEndpoint,
                    Message: AWSPlugin.payload(userData.platform, payload)
                }, (err, data) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(data.EndpointArn);
                });
            }
        ));
    }
}

const awsPlugin =  async (fastify, opts, next) => {
    const awsHelperPlugin = new AWSPlugin(fastify.config);
    fastify.decorate('awsPlugin', awsHelperPlugin);
    next();
};
export default awsPlugin;
