import { Permission } from '../entities/user.entity';
export declare class CreateAdminDto {
    username: string;
    name: string;
    password: string;
    email: string;
    phoneNumber?: string;
    permission?: Permission;
}
