import { LinktreeService } from './linktree.service';
import { CreateLinktreeDto } from './dto/create-linktree.dto';
import { UpdateLinktreeDto } from './dto/update-linktree.dto';
export declare class LinktreeController {
    private readonly linktreeService;
    constructor(linktreeService: LinktreeService);
    create(createDto: CreateLinktreeDto): Promise<import("./entity/linktree.entity").Linktree>;
    findAll(username: string): Promise<import("./entity/linktree.entity").Linktree>;
    findOne(id: string): Promise<import("./entity/linktree.entity").Linktree>;
    update(id: string, updateDto: UpdateLinktreeDto): Promise<import("./entity/linktree.entity").Linktree>;
    remove(id: string): Promise<void>;
}
