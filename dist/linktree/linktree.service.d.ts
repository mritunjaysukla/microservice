import { Repository } from 'typeorm';
import { CreateLinktreeDto } from './dto/create-linktree.dto';
import { UpdateLinktreeDto } from './dto/update-linktree.dto';
import { User } from 'src/user/entities/user.entity';
import { Linktree } from './entity/linktree.entity';
export declare class LinktreeService {
    private readonly linktreeRepo;
    private readonly userRepo;
    constructor(linktreeRepo: Repository<Linktree>, userRepo: Repository<User>);
    create(dto: CreateLinktreeDto): Promise<Linktree>;
    findAll(): Promise<Linktree[]>;
    findOne(id: string): Promise<Linktree>;
    update(userId: string, dto: UpdateLinktreeDto): Promise<Linktree>;
    remove(id: string): Promise<void>;
    findByUser(username: string): Promise<Linktree>;
}
