import { SiteSetting } from '../../site-setting/entity/site-setting.entity';
import { SitePortfolioImages } from '../../site-portfolio-images/entity/site-portfolio-images.entity';
export declare class SitePortfolio {
    id: string;
    projectName: string;
    shootName: string;
    filesCount: number;
    thumbnail: string;
    siteSetting: SiteSetting;
    images: SitePortfolioImages[];
}
