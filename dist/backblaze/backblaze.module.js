"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackblazeModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const backblaze_service_1 = require("./backblaze.service");
const typeorm_1 = require("@nestjs/typeorm");
const upload_entity_1 = require("./entity/upload.entity");
let BlackblazeModule = class BlackblazeModule {
};
BlackblazeModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([upload_entity_1.Upload]),
        ],
        providers: [backblaze_service_1.BackblazeService],
        exports: [backblaze_service_1.BackblazeService],
    })
], BlackblazeModule);
exports.BlackblazeModule = BlackblazeModule;
//# sourceMappingURL=backblaze.module.js.map