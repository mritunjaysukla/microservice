import { SitePortfolio } from '../../site-portfolio/entity/site-portfolio.entity';
import { SiteTestimonial } from '../../site-testimonial/entity/site-testimonial.entity';
import { User } from '../../user/entities/user.entity';
import { PortfolioView } from './portfolio-view.entity';
export declare enum ColorSchema {
    LIGHT = "light",
    DARK = "dark",
    CUSTOM = "custom"
}
export type WatermarkOptions = {
    position: 'full' | 'center' | 'bottom-right' | 'custom';
    opacity: number;
    scale: number;
    customX: number;
    customY: number;
    pattern: 'diagonal' | 'grid' | 'radial' | 'unsplash';
    text: string;
    textColor: string;
    textSize: number;
    textRotation: number;
    spacing: number;
};
export declare class SiteSetting {
    id: string;
    watermark: WatermarkOptions;
    portfolioCoverImg: string;
    userAgreement: string;
    legalAgreement: string;
    publishUserAgreement: boolean;
    publishLegalAgreement: boolean;
    location: {
        latitude: number;
        longitude: number;
    };
    colorSchema: ColorSchema;
    brandText: string;
    portfolioViewsCount: number;
    brandLogo: string;
    facebookLink: string;
    instagramLink: string;
    linkedinLink: string;
    youtubeLink: string;
    description: string;
    serviceStarted: Date;
    totalProject: number;
    happyClient: number;
    showBrandLogo: boolean;
    user: User;
    testimonials: SiteTestimonial[];
    portfolios: SitePortfolio[];
    portfolioViews: PortfolioView[];
}
