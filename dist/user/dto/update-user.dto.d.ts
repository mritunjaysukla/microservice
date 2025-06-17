import { Status, Permission } from '../entities/user.entity';
export declare class UpdateUserDto {
    name?: string;
    username?: string;
    dateOfBirth?: Date;
    email?: string;
    phoneNumber?: string;
    status?: Status;
    permission?: Permission;
    avatar?: string;
    [key: string]: any;
}
