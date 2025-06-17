"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SharedUserModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const shared_user_service_1 = require("./shared-user.service");
const shared_user_entity_1 = require("./entity/shared-user.entity");
const user_entity_1 = require("../user/entities/user.entity");
const project_entity_1 = require("../project/entities/project.entity");
const project_module_1 = require("src/project/project.module");
const user_module_1 = require("src/user/user.module");
const shared_user_controller_1 = require("./shared-user.controller");
let SharedUserModule = class SharedUserModule {
};
SharedUserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([shared_user_entity_1.SharedUser, user_entity_1.User, project_entity_1.Project]),
            (0, common_1.forwardRef)(() => project_module_1.ProjectsModule),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
        ],
        controllers: [shared_user_controller_1.SharedUserController],
        providers: [shared_user_service_1.SharedUserService],
        exports: [shared_user_service_1.SharedUserService],
    })
], SharedUserModule);
exports.SharedUserModule = SharedUserModule;
//# sourceMappingURL=shared-user.module.js.map