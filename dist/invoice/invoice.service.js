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
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./entity/invoice.entity");
let InvoiceService = class InvoiceService {
    constructor(invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }
    async create(createInvoiceDto) {
        try {
            const invoice = this.invoiceRepository.create(createInvoiceDto);
            const createdInvoice = await this.invoiceRepository.save(invoice);
            if (!createdInvoice || !createdInvoice.id) {
                throw new Error('Failed to create invoice or missing ID');
            }
            return createdInvoice.id;
        }
        catch (error) {
            console.error('Error creating invoice:', error);
            throw new Error('An error occurred while creating the invoice. Please try again.');
        }
    }
    async findAll() {
        return this.invoiceRepository.find();
    }
    async findOne(id) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id },
        });
        if (!invoice) {
            throw new common_1.NotFoundException(`Invoice with ID ${id} not found`);
        }
        return invoice;
    }
    async update(id, updateInvoiceDto) {
        const invoice = await this.findOne(id);
        Object.assign(invoice, updateInvoiceDto);
        return this.invoiceRepository.save(invoice);
    }
    async delete(id) {
        const invoice = await this.findOne(id);
        await this.invoiceRepository.delete(invoice.id);
        return { message: 'Invoice deleted successfully' };
    }
};
InvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InvoiceService);
exports.InvoiceService = InvoiceService;
//# sourceMappingURL=invoice.service.js.map