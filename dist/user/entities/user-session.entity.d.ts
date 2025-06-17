import { User } from './user.entity';
export declare class UserSession {
    id: string;
    user: User;
    ipAddress: string;
    userAgent: string;
    deviceName: string;
    deviceType: string;
    os: string;
    browser: string;
    location: string;
    loginAt: Date;
    logoutAt: Date;
    isFlagged: boolean;
}
