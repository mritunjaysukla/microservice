"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpModule = void 0;
const common_1 = require("@nestjs/common");
const otp_service_1 = require("./otp.service");
const otp_controller_1 = require("./otp.controller");
const typeorm_1 = require("@nestjs/typeorm");
const otp_entity_1 = require("./entity/otp.entity");
const user_module_1 = require("src/user/user.module");
const user_entity_1 = require("src/user/entities/user.entity");
const sendEmail_1 = require("src/utils/sendEmail");
const send_email_module_1 = require("src/send-email/send-email.module");
const auth_service_1 = require("src/user/services/auth/auth.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const shared_user_service_1 = require("src/shared-user/shared-user.service");
const shared_user_entity_1 = require("src/shared-user/entity/shared-user.entity");
const project_entity_1 = require("src/project/entities/project.entity");
const user_session_entity_1 = require("src/user/entities/user-session.entity");
let OtpModule = class OtpModule {
};
OtpModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([otp_entity_1.OTP, user_entity_1.User, shared_user_entity_1.SharedUser, project_entity_1.Project, user_session_entity_1.UserSession]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            send_email_module_1.SendEmailModule,
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
        ],
        providers: [otp_service_1.OtpService, sendEmail_1.MailerService, auth_service_1.AuthService, shared_user_service_1.SharedUserService],
        controllers: [otp_controller_1.OtpController],
        exports: [otp_service_1.OtpService],
    })
], OtpModule);
exports.OtpModule = OtpModule;
//# sourceMappingURL=otp.module.js.map