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
exports.NotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const note_entity_1 = require("./entity/note.entity");
let NotesService = class NotesService {
    constructor(notesRepository) {
        this.notesRepository = notesRepository;
    }
    async create(createNoteDto, user) {
        const note = this.notesRepository.create({
            ...createNoteDto,
            user,
        });
        return this.notesRepository.save(note);
    }
    async findAll(user, page = 1, limit = 10) {
        const [data, total] = await this.notesRepository.findAndCount({
            where: { user: { id: user.id } },
            order: { date: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, pageNumber: page };
    }
    async findOne(id) {
        const note = await this.notesRepository.findOne({
            where: { id },
        });
        if (!note)
            throw new common_1.NotFoundException('Note not found');
        return note;
    }
    async update(id, updateNoteDto) {
        const note = await this.findOne(id);
        Object.assign(note, updateNoteDto);
        return this.notesRepository.save(note);
    }
    async remove(id) {
        const note = await this.findOne(id);
        await this.notesRepository.remove(note);
    }
};
NotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(note_entity_1.Note)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotesService);
exports.NotesService = NotesService;
//# sourceMappingURL=notes.service.js.map