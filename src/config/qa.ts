
const qa = {
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
        bucketName : process.env.BUCKET_NAME
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
export default qa;
