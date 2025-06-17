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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteFile = void 0;
const typeorm_1 = require("typeorm");
const fav_folder_entity_1 = require("./fav-folder.entity");
let FavoriteFile = class FavoriteFile {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FavoriteFile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => fav_folder_entity_1.FavoriteFolder, (folder) => folder.files, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", fav_folder_entity_1.FavoriteFolder)
], FavoriteFile.prototype, "favFolder", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FavoriteFile.prototype, "fileId", void 0);
FavoriteFile = __decorate([
    (0, typeorm_1.Entity)('favorite_files')
], FavoriteFile);
exports.FavoriteFile = FavoriteFile;
//# sourceMappingURL=fav-files.entity.js.map