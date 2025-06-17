/// <reference types="multer" />
import { CreateSiteTestimonialDto } from './dto/create-site-testimonial.dto';
import { SiteTestimonialService } from './site-testimonial.service';
import { UpdateSiteTestimonialDto } from './dto/update-site-testimonial.dto';
export declare class SiteTestimonialController {
    private testimonialService;
    constructor(testimonialService: SiteTestimonialService);
    findByUserId(userId: string): Promise<import("./entity/site-testimonial.entity").SiteTestimonial[]>;
    create(req: any, createDto: CreateSiteTestimonialDto, clientImage: Express.Multer.File): Promise<import("./entity/site-testimonial.entity").SiteTestimonial>;
    selectTestimonialsByIds(body: {
        ids: string[];
    }): Promise<import("./entity/site-testimonial.entity").SiteTestimonial[]>;
    update(id: string, req: any, updateDto: UpdateSiteTestimonialDto, clientImage?: Express.Multer.File): Promise<import("./entity/site-testimonial.entity").SiteTestimonial>;
    findOne(id: string): Promise<import("./entity/site-testimonial.entity").SiteTestimonial>;
}
