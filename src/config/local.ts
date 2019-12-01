
const local =  {
    port: 3010,
    db: {
        connectionString: 'mongodb://localhost:27017/csr'
    },
    otp: {
        mobile: {
            expiry: '',
            length: '',
            templateId: '',
            authKey: '',
            invisible: '',
            baseUrl: 'http://localhost:1234'
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
export default local;
