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
        updateLocation: (userId: number, data: object) => string;
        insertLocation: (data: object) => Promise<object>;
        listLocation: (data: string) => Promise<object>;
        getZoneFromLocation: (coordinates: any, type: string) => Promise<object>;
        updateUsedDateTime: (userid: number) => Promise<object>;
        getLiveCampaigns: () => Promise<object>;
        updateEntries: (taskId: string, doIncrement: boolean) => Promise<object>;
        updateProfile: (userId: number, data: object) => Promise<object>;
        verifyMobileOTP: (mobile: number, otp: number) => Promise<object>;
        generateMobileOTP: (mobile: number) => Promise<object>;
        resendMobileOTP: (mobile: number) => Promise<object>;
        httpClient: HttpClient;
        insertUserTask: (userId: number, data: object) => Promise<object>;
        updateTask: (userId: number, data: object) => Promise<object>;
        updateRewards: (userId: number, rewards: number) => Promise<object>;
        addRewards: (userId: number, rewards: number) => Promise<object>;
        editRewards: (rewardId: string, userId: number, rewards: number) => Promise<object>;
        getRewards: () => Promise<object>;
        getLeaderboard: (userId: number, rewards: string) => Promise<object>;
        getCampaignDetails: (campaignId: string, lastRecordCreatedAt: Date) => Promise<object>;
        getUserTasks: (userId: number, data: object) => Promise<object>;
        getLocation: () => Promise<object>;
        getUserTask: (taskId: string) => Promise<object>;
        findDuplicateLocationData: (data: object) => Promise<object>;
        updateMobileDeviceEndpoint: (userId: number, mobileEndpointArn: string, platform: string) => string;
        findLocationBasedUserData: (locationIds: any) => Promise<object>;
    }
}
