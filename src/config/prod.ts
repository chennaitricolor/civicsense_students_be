
const prod =  {
    port: process.env.PORT,
    db: {
        connectionString: process.env.MONGO_CONNECTION
    },
    otp: {
        mobile: {
            expiry: '',
            length: '',
            templateId: process.env.OTP_TEMPLATE_ID,
            authKey: process.env.OTP_AUTHKEY,
            invisible: '',
            baseUrl: process.env.OTP_URL
        }
    },
    s3: {
        taskBucketName : process.env.TASK_BUCKET_NAME,
        assetBucketName : process.env.ASSET_BUCKET_NAME,
        kmlId: process.env.KMLID
    },
    aws: {
        accessKey :  process.env.ACCESS_KEY,
        secretAccessKey : process.env.SECRETACCESSKEY
    },
    sns: {
        applicationArn: process.env.APPLICATION_ARN,
        region: process.env.REGION
    }
};
export default prod;
