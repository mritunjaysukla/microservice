import { User } from '../../user/entities/user.entity';
export declare class Note {
    id: string;
    title: string;
    date: Date;
    updatedAt: Date;
    description: string;
    user: User;
}
