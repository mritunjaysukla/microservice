import { Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './entity/note.entity';
import { User } from 'src/user/entities/user.entity';
export declare class NotesService {
    private notesRepository;
    constructor(notesRepository: Repository<Note>);
    create(createNoteDto: CreateNoteDto, user: User): Promise<Note>;
    findAll(user: User, page?: number, limit?: number): Promise<{
        data: Note[];
        total: number;
        pageNumber: number;
    }>;
    findOne(id: string): Promise<Note>;
    update(id: string, updateNoteDto: UpdateNoteDto): Promise<Note>;
    remove(id: string): Promise<void>;
}
