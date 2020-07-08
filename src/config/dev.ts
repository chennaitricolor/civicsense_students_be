
const dev =  {
    port: process.env.PORT,
    covidTracker: process.env.COVID_TRACKER,
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
        kmlId: process.env.KMLID,
        healthkmlId: process.env.HEALTH_KMLID,
        testkmlId: process.env.TEST_KMLID
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
        campaignId: process.env.POSITIVE_TRACKER_CAMP_ID
    }
};
export default dev;
