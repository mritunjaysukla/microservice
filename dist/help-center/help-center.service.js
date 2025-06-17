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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpCenterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const help_center_entity_1 = require("./entity/help-center.entity");
let HelpCenterService = class HelpCenterService {
    constructor(helpCenterRepository) {
        this.helpCenterRepository = helpCenterRepository;
    }
    async createHelpCenter(helpCenter) {
        const newHelpCenter = this.helpCenterRepository.create(helpCenter);
        return await this.helpCenterRepository.save(newHelpCenter);
    }
    async updateHelpCenter(id, helpCenter) {
        const existingHelpCenter = await this.helpCenterRepository.findOne({
            where: { id },
        });
        if (!existingHelpCenter) {
            return { message: 'Help Center not found' };
        }
        Object.assign(existingHelpCenter, helpCenter);
        const updated = await this.helpCenterRepository.save(existingHelpCenter);
        return { message: 'Help Center updated successfully', data: updated };
    }
    async getHelpCenterByCategory(category) {
        const helpCenter = await this.helpCenterRepository.find({
            where: { category },
        });
        if (!helpCenter || helpCenter.length === 0) {
            return {
                message: 'No Help Center articles found in this category',
                data: [],
            };
        }
        return {
            message: 'Help Center articles retrieved successfully',
            data: helpCenter,
        };
    }
    async deleteHelpCenter(id) {
        const existingHelpCenter = await this.helpCenterRepository.findOne({
            where: { id },
        });
        if (!existingHelpCenter) {
            return { message: 'Help Center not found' };
        }
        await this.helpCenterRepository.remove(existingHelpCenter);
        return { message: 'Help Center deleted successfully' };
    }
};
HelpCenterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(help_center_entity_1.HelpCenter)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], HelpCenterService);
exports.HelpCenterService = HelpCenterService;
//# sourceMappingURL=help-center.service.js.map