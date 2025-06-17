export declare enum HelpCenterSection {
    PROJECTS = "projects",
    PAYMENTS = "payments",
    SUBSCRIPTION = "subscription",
    PRODUCTS = "products",
    GALLERY = "gallery",
    PORTFOLIO = "portfolio"
}
export declare class HelpCenter {
    id: string;
    category: HelpCenterSection;
    title: string;
    description: string;
    videoUrl: string;
}
