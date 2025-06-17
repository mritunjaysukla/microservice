import { Profile, Strategy } from 'passport-facebook';
import { UserService } from 'src/user/services/user/user.service';
import { PasswordService } from 'src/user/services/password/password.service';
declare const FacebookStrategy_base: new (...args: any[]) => Strategy;
export declare class FacebookStrategy extends FacebookStrategy_base {
    private readonly userService;
    private readonly passwordService;
    constructor(userService: UserService, passwordService: PasswordService);
    validate(accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user: any) => void): Promise<any>;
}
export {};
