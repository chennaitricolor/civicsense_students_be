
const local =  {
    port: 3010,
    covidTracker: true,
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
        assetBucketName : process.env.ASSET_BUCKET_NAME,
        publicBucketName: process.env.PUBLIC_BUCKET_NAME,

    },
    aws: {
        accessKey :  process.env.ACCESS_KEY,
        secretAccessKey : process.env.SECRETACCESSKEY,
        quicksight: {
            iamRegion: process.env.AWS_IAM_REGION,
            credentials: {
                AccountId: process.env.AWS_IAM_ACCOUNT_ID,
                RoleSessionName: process.env.AWS_IAM_ROLE_SESSION_NAME,
                RoleArn: process.env.AWS_IAM_ROLE_ARN,
                IdentityPoolId: process.env.AWS_IAM_POOL_ID,
            },
            region: process.env.AWS_QS_REGION,
            dashboard: {
              AwsAccountId: process.env.AWS_IAM_ACCOUNT_ID,
              DashboardId: process.env.AWS_QS_DASHBOARD_ID,
              IdentityType: 'IAM',
              ResetDisabled: true,
              SessionLifetimeInMinutes: 100,
              UndoRedoDisabled: false,
            },
        },
    },
    sns: {
        applicationArn: process.env.APPLICATION_ARN,
        region: process.env.REGION
    },
    static: {
        campaignId: process.env.POSITIVE_TRACKER_CAMP_ID,
        photoHost: process.env.PHOTO_HOST,
        username: 'user',
        password: 'password',
        cglDashboardId: process.env.AWS_QS_CGL_DASHBOARD_ID
    }
};
export default local;
