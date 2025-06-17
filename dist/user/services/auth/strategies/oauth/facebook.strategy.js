"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_facebook_1 = require("passport-facebook");
const dotenv = require("dotenv");
const crypto = require("crypto");
const user_service_1 = require("src/user/services/user/user.service");
const user_entity_1 = require("src/user/entities/user.entity");
const password_service_1 = require("src/user/services/password/password.service");
dotenv.config();
let FacebookStrategy = class FacebookStrategy extends (0, passport_1.PassportStrategy)(passport_facebook_1.Strategy, 'facebook') {
    constructor(userService, passwordService) {
        super({
            clientID: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
            callbackURL: `${process.env.BASE_URL}/user/facebook/redirect`,
            scope: 'email',
            profileFields: ['emails', 'name'],
        });
        this.userService = userService;
        this.passwordService = passwordService;
    }
    async validate(accessToken, refreshToken, profile, done) {
        const { id, name, emails } = profile;
        if (!emails || emails.length === 0) {
            return done(new Error('No email provided by Facebook'), null);
        }
        let user = await this.userService.findByFacebookId(id);
        if (!user) {
            user = await this.userService.findByEmail(emails[0].value);
        }
        if (!user) {
            const generatedPassword = crypto.randomBytes(16).toString('hex');
            user = await this.userService.createUserFromFacebook({
                facebookId: id,
                email: emails[0].value,
                name: `${name?.givenName || ''} ${name?.familyName || ''}`,
                username: emails[0].value.split('@')[0],
                password: await this.passwordService.generate(generatedPassword),
                role: user_entity_1.Role.PHOTOGRAPHER,
            });
        }
        done(null, user);
    }
};
FacebookStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _a : Object, typeof (_b = typeof password_service_1.PasswordService !== "undefined" && password_service_1.PasswordService) === "function" ? _b : Object])
], FacebookStrategy);
exports.FacebookStrategy = FacebookStrategy;
//# sourceMappingURL=facebook.strategy.js.map