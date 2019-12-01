
const qa = {
    port: process.env.PORT,
    db: {
        connectionString: process.env.MONGO_CONNECTION
    },
    otp: {
        mobile: {
            expiry: '',
            length: '',
            templateId: '',
            authKey: process.env.MOBILE_OTP_AUTH_KEY,
            invisible: '',
            baseUrl: 'https://api.msg91.com/api/v5/otp'
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
