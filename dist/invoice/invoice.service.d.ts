import { Repository } from 'typeorm';
import { Invoice } from './entity/invoice.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
export declare class InvoiceService {
    private readonly invoiceRepository;
    constructor(invoiceRepository: Repository<Invoice>);
    create(createInvoiceDto: CreateInvoiceDto): Promise<string>;
    findAll(): Promise<Invoice[]>;
    findOne(id: string): Promise<Invoice>;
    update(id: string, updateInvoiceDto: UpdateInvoiceDto): Promise<Invoice>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
