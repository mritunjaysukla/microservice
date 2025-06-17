"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityQuestionsModule = void 0;
const common_1 = require("@nestjs/common");
const security_questions_service_1 = require("./security-questions.service");
const security_questions_controller_1 = require("./security-questions.controller");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("src/user/entities/user.entity");
const user_security_answer_entity_1 = require("./entity/user-security-answer.entity");
const security_questions_entity_1 = require("./entity/security-questions.entity");
const auth_service_1 = require("src/user/services/auth/auth.service");
const user_session_entity_1 = require("src/user/entities/user-session.entity");
const subscription_entity_1 = require("src/subscription/entity/subscription.entity");
const shared_user_entity_1 = require("src/shared-user/entity/shared-user.entity");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const photographer_client_entity_1 = require("src/user/entities/photographer-client.entity");
const project_entity_1 = require("src/project/entities/project.entity");
const otp_entity_1 = require("src/otp/entity/otp.entity");
const userStorage_entity_1 = require("src/storage/entity/userStorage.entity");
const folder_entity_1 = require("src/folder/entity/folder.entity");
const storage_module_1 = require("src/storage/storage.module");
const plan_entity_1 = require("src/plan/entity/plan.entity");
const upload_module_1 = require("src/upload/upload.module");
const user_module_1 = require("src/user/user.module");
const otp_module_1 = require("src/otp/otp.module");
let SecurityQuestionsModule = class SecurityQuestionsModule {
};
SecurityQuestionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                user_security_answer_entity_1.UserSecurityAnswer,
                security_questions_entity_1.SecurityQuestion,
                user_session_entity_1.UserSession,
                subscription_entity_1.Subscription,
                shared_user_entity_1.SharedUser,
                upload_entity_1.Upload,
                photographer_client_entity_1.photographerClient,
                project_entity_1.Project,
                otp_entity_1.OTP,
                userStorage_entity_1.UserStorage,
                folder_entity_1.Folder,
                plan_entity_1.Plan,
            ]),
            user_module_1.UserModule,
            upload_module_1.UploadModule,
            storage_module_1.StorageModule,
            otp_module_1.OtpModule,
        ],
        providers: [security_questions_service_1.SecurityQuestionsService, auth_service_1.AuthService],
        controllers: [security_questions_controller_1.SecurityQuestionsController],
        exports: [security_questions_service_1.SecurityQuestionsService],
    })
], SecurityQuestionsModule);
exports.SecurityQuestionsModule = SecurityQuestionsModule;
//# sourceMappingURL=security-questions.module.js.map