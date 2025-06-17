import { User } from '../../../src/user/entities/user.entity';
export declare class OTP {
    id: string;
    userId: string;
    code: string;
    expiresAt: Date;
    createdAt: Date;
    user: User;
}
