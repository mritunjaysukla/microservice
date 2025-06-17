import { Subscription } from '../entity/subscription.entity';
export declare class PaginationDto {
    page?: number;
    limit?: number;
}
export interface PaginatedSubscriptionResponse {
    items: Subscription[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
