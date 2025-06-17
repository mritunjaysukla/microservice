import { Repository } from 'typeorm';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { Discount } from './entity/discount.entity';
export declare class DiscountService {
    private readonly discountRepository;
    constructor(discountRepository: Repository<Discount>);
    create(createDiscountDto: CreateDiscountDto): Promise<Discount>;
    findAll(): Promise<Discount[]>;
    findOne(id: string): Promise<Discount>;
    update(id: string, updateDiscountDto: UpdateDiscountDto): Promise<Discount>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
