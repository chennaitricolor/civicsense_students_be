import http from 'http';
import HttpClient from '../../src/helpers/httpClient';

declare module 'fastify' {
    export interface FastifyInstance<HttpServer = http.Server, HttpRequest = http.IncomingMessage, HttpResponse = http.ServerResponse> {
        config: {
            port: number
            cookie: string
            s3: {
                bucketName: string,
            },
            aws: {
                accessKey: string,
                secretAccessKey: string
            },
            sns: {
                applicationArn: string
                region: string
            }
        };
        insertUser: (data: object, isAdmin: boolean) => Promise<object>;
        login: (data: object) => Promise<object>;
        insertCampaign: (data: object) => Promise<object>;
        updateLocation: (userId: string, data: object) => string;
        insertLocation: (data: object) => Promise<object>;
        listLocation: (data: string) => Promise<object>;
        getZoneFromLocation: (coordinates: any, type: string) => Promise<object>;
        updateUsedDateTime: (userid: string) => Promise<object>;
        getLiveCampaigns: () => Promise<object>;
        updateEntries: (taskId: string) => Promise<object>;
        updateProfile: (userId: string, data: object) => Promise<object>;
        userIdAvailability: (data: object, exists: boolean) => Promise<object>;
        findUserIdByEmail: (data: object) => Promise<object>;
        verifyMobileOTP: (mobile: number, otp: number) => Promise<object>;
        verifyEmailOTP: (email: string, otp: number) => Promise<object>;
        generateMobileOTP: (mobile: number) => Promise<object>;
        generateEmailOTP: (email: string) => Promise<object>;
        resendMobileOTP: (mobile: number) => Promise<object>;
        httpClient: HttpClient;
        updatePassword: (userId: string, password: string, isAdmin: boolean) => Promise<object>;
        insertUserTask: (userId: string, data: object) => Promise<object>;
        updateTask: (userId: string, data: object) => Promise<object>;
        updateRewards: (userId: string, rewards: number) => Promise<object>;
        getLeaderboard: (userId: string, rewards: string) => Promise<object>;
        getCampaignDetails: (campaignId: string, lastRecordCreatedAt: Date) => Promise<object>;
        getUserTasks: (userId: string, data: object) => Promise<object>;
        getUserTask: (taskId: string) => Promise<object>;
        findDuplicateLocationData: (data: object) => Promise<object>;
        updateMobileDeviceEndpoint: (userId: string, mobileEndpointArn: string, platform: string) => string;
        findLocationBasedUserData: (locationIds: any) => Promise<object>;
    }
}
