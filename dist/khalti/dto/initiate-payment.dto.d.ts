declare class CustomerInfo {
    name?: string;
    email?: string;
    phone?: string;
}
declare class BreakdownItem {
    label: string;
    amount: number;
}
export declare class ProductDetail {
    name: string;
    identity: string;
    unit_price: number;
    quantity: number;
    Plan: string;
    total_price: number;
}
export declare class InitiatePaymentDto {
    subscriptionId: string;
    return_url: string;
    website_url: string;
    amount: number;
    purchase_order_id: string;
    purchase_order_name: string;
    customer_info?: CustomerInfo;
    amount_breakdown?: BreakdownItem[];
    product_details?: ProductDetail[];
    merchant_username?: string;
    merchant_extra?: string;
    user?: any;
}
export {};
