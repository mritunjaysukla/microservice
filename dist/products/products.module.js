"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const product_entity_1 = require("./entity/product.entity");
const products_service_1 = require("./products.service");
const products_controller_1 = require("./products.controller");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const user_entity_1 = require("src/user/entities/user.entity");
const upload_module_1 = require("src/upload/upload.module");
const project_setting_entity_1 = require("src/project-setting/entity/project-setting.entity");
const datahub_module_1 = require("src/datahub/datahub.module");
let ProductsModule = class ProductsModule {
};
ProductsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([product_entity_1.Product, upload_entity_1.Upload, user_entity_1.User, project_setting_entity_1.ProjectSetting]),
            upload_module_1.UploadModule,
            datahub_module_1.DatahubModule
        ],
        providers: [products_service_1.ProductService],
        controllers: [products_controller_1.ProductsController],
        exports: [products_service_1.ProductService],
    })
], ProductsModule);
exports.ProductsModule = ProductsModule;
//# sourceMappingURL=products.module.js.map