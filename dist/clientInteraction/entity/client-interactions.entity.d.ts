import { User } from '../../user/entities/user.entity';
export declare class ClientInteraction {
    id: string;
    clientName: string;
    contactInfo: string;
    notes: string;
    dateOfInteraction: string;
    user: User;
}
