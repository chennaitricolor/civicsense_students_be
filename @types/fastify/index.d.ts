import http from 'http';
import HttpClient from '../../src/helpers/httpClient';

declare module 'fastify' {
    export interface FastifyInstance<HttpServer = http.Server, HttpRequest = http.IncomingMessage, HttpResponse = http.ServerResponse> {
        addRewards: (userId: number, rewards: number) => Promise<object>;
        config: {
            covidTracker: boolean,
            aws: {
                accessKey: string,
                secretAccessKey: string
            },
            cookie: string
            port: number
            s3: {
                bucketName: string,
            },
            sns: {
                applicationArn: string
                region: string
            }
        };
        deleteCampaign: (id: string) => Promise<object>;
        editRewards: (rewardId: string, userId: number, rewards: number) => Promise<object>;
        findAdmin: (userId: number) => string;
        findDuplicateLocationData: (data: object) => Promise<object>;
        findLocationBasedUserData: (locationIds: any) => Promise<object>;
        generateMobileOTP: (mobile: number) => Promise<object>;
        getCampaignDetails: (campaignId: string, lastRecordCreatedAt: Date) => Promise<object>;
        getLeaderboard: (userId: number, rewards: string) => Promise<object>;
        getLiveCampaigns: (live: boolean) => Promise<object>;
        getLocation: () => Promise<object>;
        getPositiveReportDetails: (filterObject: object, session: object) => Promise<object>;
        getReportDetails: (filterObject: object, session: object) => Promise<object>;
        getRewards: () => Promise<object>;
        getStatic: () => Promise<object>;
        getUserTask: (taskId: string) => Promise<object>;
        getUserTasks: (userId: number, data: object) => Promise<object>;
        getZoneFromLocation: (coordinates: any, type: string) => Promise<object>;
        httpClient: HttpClient;
        insertCampaign: (data: object) => Promise<object>;
        insertLocation: (data: object) => Promise<object>;
        insertUser: (data: object, isAdmin: boolean) => Promise<object>;
        insertUserTask: (userId: number, data: object, covidTracker: boolean) => Promise<object>;
        listLocation: (data: string) => Promise<object>;
        login: (data: object) => Promise<object>;
        resendMobileOTP: (mobile: number) => Promise<object>;
        updateCampaign: (data: object, id: string) => Promise<object>;
        updateEntries: (taskId: string, doIncrement: boolean) => Promise<object>;
        updateLocation: (userId: number, data: object) => string;
        updateMobileDeviceEndpoint: (userId: number, mobileEndpointArn: string, platform: string) => string;
        updateProfile: (userId: number, data: object) => Promise<object>;
        updateRewards: (userId: number, rewards: number) => Promise<object>;
        updateTask: (userId: number, data: object) => Promise<object>;
        updateUsedDateTime: (userid: number) => Promise<object>;
        userIdAvailability: (data: object, exists: boolean) => Promise<object>;
        verifyMobileOTP: (mobile: number, otp: number) => Promise<object>;
        verifyUserNameAndPassword: (data: object) => Promise<object>;
    }
}
