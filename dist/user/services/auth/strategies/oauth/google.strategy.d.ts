import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UserService } from 'src/user/services/user/user.service';
import { PasswordService } from 'src/user/services/password/password.service';
import { Request } from 'express';
declare const GoogleStrategy_base: new (...args: any[]) => Strategy;
export declare class GoogleStrategy extends GoogleStrategy_base {
    private readonly userService;
    private readonly passwordService;
    constructor(userService: UserService, passwordService: PasswordService);
    validate(req: Request, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any>;
}
export {};
