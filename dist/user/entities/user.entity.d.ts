import { Project } from '../../project/entities/project.entity';
import { OTP } from '../../otp/entity/otp.entity';
import { Subscription } from '../../subscription/entity/subscription.entity';
import { SocialAccount } from '../../socialAccounts/entity/socialAccounts.entity';
import { ClientInteraction } from '../../clientInteraction/entity/client-interactions.entity';
import { Feedback } from '../../feedback/entity/feedback.entity';
import { SharedUser } from '../../shared-user/entity/shared-user.entity';
import { SiteSetting } from '../../site-setting/entity/site-setting.entity';
import { Payment } from '../../payment/entity/payment.entity';
import { Cards } from '../../cards/entity/cards.entity';
import { FavoriteFolder } from '../../fav-folder/entity/fav-folder.entity';
import { Kyc_user } from '../../kyc-verification/entity/kyc-user.entity';
import { UserSession } from './user-session.entity';
import { Linktree } from '../../linktree/entity/linktree.entity';
import { Note } from '../../notes/entity/note.entity';
import { Task } from '../../tasks/entity/task.entity';
import { Notification } from '../../notification/entity/notification.entity';
export declare enum Role {
    PHOTOGRAPHER = "photographer",
    ADMIN = "admin",
    CLIENT = "client"
}
export declare enum Status {
    ACTIVE = "active",
    INACTIVE = "inactive"
}
export declare enum Permission {
    READ = "read",
    WRITE = "write",
    DELETE = "delete"
}
export declare class User {
    id: string;
    name: string;
    username: string;
    dateOfBirth: Date;
    subdomain: string;
    password: string;
    email: string | null;
    phoneNumber: string;
    role: Role;
    token: string | null;
    googleId?: string | null;
    facebookId?: string;
    avatar?: string;
    status: Status;
    permission?: Permission;
    isVerified: boolean;
    isKycVerified: boolean;
    is2FaActive: boolean;
    isPassKeyActive: boolean;
    isSecurityQuestionEnabled: boolean;
    studioAddress?: string;
    occupation?: string;
    secret?: string;
    opathUrl?: string;
    credentialID: string;
    credentialPublicKey: string;
    counter: number;
    createdAt: Date;
    updatedAt: Date;
    projects: Project[];
    otp: OTP | null;
    subscriptions: Subscription[];
    socialAccounts: SocialAccount[];
    clientInteractions: ClientInteraction[];
    feedback: Feedback[];
    sharedUsers: SharedUser[];
    payments: Payment[];
    siteSetting: SiteSetting | null;
    cards: Cards;
    favorites: FavoriteFolder[];
    kyc: Kyc_user;
    sessions: UserSession[];
    linktree: Linktree;
    notes: Note[];
    tasks: Task[];
    notifications: Notification[];
    generateSubdomain(): void;
}
