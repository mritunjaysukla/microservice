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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entity/task.entity");
let TasksService = class TasksService {
    constructor(tasksRepository) {
        this.tasksRepository = tasksRepository;
    }
    async create(createTaskDto, user) {
        const task = this.tasksRepository.create({
            ...createTaskDto,
            user,
        });
        return await this.tasksRepository.save(task);
    }
    async findAll(user, page = 1, limit = 10) {
        const [tasks, total] = await this.tasksRepository.findAndCount({
            where: { user: { id: user.id } },
            order: { addedAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        if (!tasks.length) {
            return { data: [], total: 0, pageNumber: page };
        }
        return { data: tasks, total, pageNumber: page };
    }
    async findOne(id, user) {
        const task = await this.tasksRepository.findOne({
            where: { id, user: { id: user.id } },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        return task;
    }
    async update(id, updateTaskDto, user) {
        const task = await this.findOne(id, user);
        Object.assign(task, updateTaskDto);
        console.log(updateTaskDto);
        if (task.status === task_entity_1.TaskStatus.COMPLETED) {
            task.completedAt = new Date();
        }
        console.log(task);
        return await this.tasksRepository.save(task);
    }
    async remove(id, user) {
        const task = await this.findOne(id, user);
        await this.tasksRepository.remove(task);
    }
};
TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksService);
exports.TasksService = TasksService;
//# sourceMappingURL=tasks.service.js.map