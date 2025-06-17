import { Role } from '../entities/user.entity';
export declare class CreateUserDto {
    username: string;
    dateOfBirth?: Date;
    name: string;
    password: string;
    email: string;
    phoneNumber?: string;
    role: Role;
    photographerId?: string | null | undefined;
    clientId?: string;
    projectId?: string | null | undefined;
    googleId?: string;
}
