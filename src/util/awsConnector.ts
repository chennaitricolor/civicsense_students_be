import S3 from 'aws-sdk/clients/s3';
import SNS from 'aws-sdk/clients/sns';

export default class AwsConnector {
    public static getS3ClientConnection(config): any {
        if (!AwsConnector.S3Client) {
            AwsConnector.S3Client = new S3(
                {
                    accessKeyId: config.aws.accessKey,
                    secretAccessKey: config.aws.secretAccessKey
                }
            );
        }
        return AwsConnector.S3Client;
    }

    public static getSNSClientConnection(config): any {
        if (!AwsConnector.SNSClient) {
            AwsConnector.SNSClient = new SNS(
                {
                    accessKeyId: config.aws.accessKey,
                    secretAccessKey: config.aws.secretAccessKey,
                    region: config.sns.region
                }
            );
        }
        return AwsConnector.SNSClient;
    }

    private static S3Client: S3;
    private static SNSClient: SNS;

    private constructor() {
    }
}
