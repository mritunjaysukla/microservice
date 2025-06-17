"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageModule = void 0;
const common_1 = require("@nestjs/common");
const storage_controller_1 = require("./storage.controller");
const storage_service_1 = require("./storage.service");
const typeorm_1 = require("@nestjs/typeorm");
const userStorage_entity_1 = require("./entity/userStorage.entity");
const user_module_1 = require("src/user/user.module");
const plan_module_1 = require("src/plan/plan.module");
const user_entity_1 = require("src/user/entities/user.entity");
let StorageModule = class StorageModule {
};
StorageModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([userStorage_entity_1.UserStorage, user_entity_1.User]),
            plan_module_1.PlanModule,
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
        ],
        controllers: [storage_controller_1.StorageController],
        providers: [storage_service_1.StorageService],
        exports: [storage_service_1.StorageService],
    })
], StorageModule);
exports.StorageModule = StorageModule;
//# sourceMappingURL=storage.module.js.map