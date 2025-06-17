import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
export declare class NotesController {
    private readonly notesService;
    constructor(notesService: NotesService);
    create(createNoteDto: CreateNoteDto, req: any): Promise<import("./entity/note.entity").Note>;
    findAll(req: any, page?: number, limit?: number): Promise<{
        data: import("./entity/note.entity").Note[];
        total: number;
        pageNumber: number;
    }>;
    findOne(id: string): Promise<import("./entity/note.entity").Note>;
    update(id: string, updateNoteDto: UpdateNoteDto): Promise<import("./entity/note.entity").Note>;
    remove(id: string): Promise<void>;
}
