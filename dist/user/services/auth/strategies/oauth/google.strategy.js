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
exports.GoogleStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const common_1 = require("@nestjs/common");
const user_entity_1 = require("src/user/entities/user.entity");
const user_service_1 = require("src/user/services/user/user.service");
const crypto = require("crypto");
const password_service_1 = require("src/user/services/password/password.service");
let GoogleStrategy = class GoogleStrategy extends (0, passport_1.PassportStrategy)(passport_google_oauth20_1.Strategy, 'google') {
    constructor(userService, passwordService) {
        super({
            clientID: process.env.GOOGLE_APP_ID,
            clientSecret: process.env.GOOGLE_APP_SECRET,
            callbackURL: `${process.env.BASE_URL}/user/google/redirect`,
            scope: ['email', 'profile'],
            passReqToCallback: true,
        });
        this.userService = userService;
        this.passwordService = passwordService;
    }
    async validate(req, accessToken, refreshToken, profile, done) {
        const { id, name, emails } = profile;
        const stateParam = req.query.state;
        let photographerId = null;
        let projectId = null;
        if (stateParam) {
            try {
                const decoded = Buffer.from(stateParam, 'base64').toString('utf-8');
                const parsedState = JSON.parse(decoded);
                photographerId = parsedState.photographerId || null;
                projectId = parsedState.projectId || null;
            }
            catch (err) {
                console.warn('Failed to decode state parameter:', err);
            }
        }
        let user = await this.userService.findByGoogleId(id);
        if (!user) {
            user = await this.userService.findByEmail(emails[0].value);
        }
        if (!user) {
            const generatedPassword = crypto.randomBytes(16).toString('hex');
            const isClient = photographerId && projectId;
            user = await this.userService.createUserFromGoogle({
                googleId: id,
                email: emails[0].value,
                name: `${name.givenName} ${name.familyName}`,
                username: emails[0].value.split('@')[0],
                password: await this.passwordService.generate(generatedPassword),
                role: isClient ? user_entity_1.Role.CLIENT : user_entity_1.Role.PHOTOGRAPHER,
                photographerId: isClient ? photographerId : null,
                projectId: isClient ? projectId : null,
            });
        }
        done(null, user);
    }
};
GoogleStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _a : Object, typeof (_b = typeof password_service_1.PasswordService !== "undefined" && password_service_1.PasswordService) === "function" ? _b : Object])
], GoogleStrategy);
exports.GoogleStrategy = GoogleStrategy;
//# sourceMappingURL=google.strategy.js.map