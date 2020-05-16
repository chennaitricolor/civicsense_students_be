
const local =  {
    port: 3010,
    db: {
        connectionString: 'mongodb://localhost:27017/csr'
    },
    otp: {
        mobile: {
            expiry: '',
            length: '',
            templateId: '5de73ee9d6fc054a9a5e0a90',
            authKey: '',
            invisible: '',
            baseUrl: 'http://localhost:1234'
        }
    },
    s3: {
        taskBucketName : process.env.TASK_BUCKET_NAME,
        assetBucketName : process.env.ASSET_BUCKET_NAME
    },
    aws: {
        accessKey :  process.env.ACCESS_KEY,
        secretAccessKey : process.env.SECRETACCESSKEY
    },
    sns: {
        applicationArn: process.env.APPLICATION_ARN,
        region: process.env.REGION
    },
    static: {
        campaignId: process.env.POSITIVE_TRACKER_CAMP_ID
    }
};
export default local;
