"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const user_controller_1 = require("./user.controller");
const auth_service_1 = require("./services/auth/auth.service");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_service_1 = require("./services/user/user.service");
const password_service_1 = require("./services/password/password.service");
const config_1 = require("@nestjs/config");
const jwt_strategy_1 = require("./services/auth/strategies/jwt/jwt.strategy");
const app_cache_module_1 = require("../app-cache/app-cache.module");
const jwt_1 = require("@nestjs/jwt");
const project_module_1 = require("src/project/project.module");
const sendEmail_1 = require("src/utils/sendEmail");
const mailer_1 = require("@nestjs-modules/mailer");
const facebook_strategy_1 = require("./services/auth/strategies/oauth/facebook.strategy");
const google_strategy_1 = require("./services/auth/strategies/oauth/google.strategy");
const client_interactions_module_1 = require("src/clientInteraction/client-interactions.module");
const shared_user_entity_1 = require("src/shared-user/entity/shared-user.entity");
const shared_user_module_1 = require("src/shared-user/shared-user.module");
const subscription_entity_1 = require("src/subscription/entity/subscription.entity");
const upload_module_1 = require("src/upload/upload.module");
const otp_module_1 = require("src/otp/otp.module");
const otp_entity_1 = require("src/otp/entity/otp.entity");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const photographer_client_entity_1 = require("./entities/photographer-client.entity");
const send_email_module_1 = require("src/send-email/send-email.module");
const user_session_entity_1 = require("./entities/user-session.entity");
const shared_user_service_1 = require("src/shared-user/shared-user.service");
const project_entity_1 = require("src/project/entities/project.entity");
const otp_service_1 = require("src/otp/otp.service");
let UserModule = class UserModule {
};
UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                shared_user_entity_1.SharedUser,
                subscription_entity_1.Subscription,
                otp_entity_1.OTP,
                upload_entity_1.Upload,
                photographer_client_entity_1.photographerClient,
                user_session_entity_1.UserSession,
                project_entity_1.Project,
            ]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const secret = configService.get('jwtSecret');
                    console.log('JWT Secret:', secret);
                    return {
                        secret,
                        signOptions: { expiresIn: '2h' },
                    };
                },
                inject: [config_1.ConfigService],
            }),
            config_1.ConfigModule,
            app_cache_module_1.AppCacheModule,
            (0, common_1.forwardRef)(() => project_module_1.ProjectsModule),
            (0, common_1.forwardRef)(() => client_interactions_module_1.ClientInteractionsModule),
            (0, common_1.forwardRef)(() => shared_user_module_1.SharedUserModule),
            (0, common_1.forwardRef)(() => otp_module_1.OtpModule),
            mailer_1.MailerModule,
            (0, common_1.forwardRef)(() => upload_module_1.UploadModule),
            project_module_1.ProjectsModule,
            send_email_module_1.SendEmailModule,
        ],
        controllers: [user_controller_1.UserController],
        providers: [
            auth_service_1.AuthService,
            user_service_1.UserService,
            password_service_1.PasswordService,
            jwt_strategy_1.JwtStrategy,
            sendEmail_1.MailerService,
            facebook_strategy_1.FacebookStrategy,
            google_strategy_1.GoogleStrategy,
            shared_user_service_1.SharedUserService,
            otp_service_1.OtpService,
        ],
        exports: [user_service_1.UserService, sendEmail_1.MailerService, jwt_1.JwtModule, shared_user_service_1.SharedUserService],
    })
], UserModule);
exports.UserModule = UserModule;
//# sourceMappingURL=user.module.js.map