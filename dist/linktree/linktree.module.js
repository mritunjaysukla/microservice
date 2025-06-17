"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinktreeModule = void 0;
const common_1 = require("@nestjs/common");
const linktree_controller_1 = require("./linktree.controller");
const linktree_service_1 = require("./linktree.service");
const typeorm_1 = require("@nestjs/typeorm");
const linktree_entity_1 = require("./entity/linktree.entity");
const user_entity_1 = require("src/user/entities/user.entity");
let LinktreeModule = class LinktreeModule {
};
LinktreeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([linktree_entity_1.Linktree, user_entity_1.User])],
        controllers: [linktree_controller_1.LinktreeController],
        providers: [linktree_service_1.LinktreeService],
        exports: [linktree_service_1.LinktreeService],
    })
], LinktreeModule);
exports.LinktreeModule = LinktreeModule;
//# sourceMappingURL=linktree.module.js.map