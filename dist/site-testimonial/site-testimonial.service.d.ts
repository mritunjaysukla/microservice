/// <reference types="multer" />
import { CreateSiteTestimonialDto } from './dto/create-site-testimonial.dto';
import { Repository } from 'typeorm';
import { UploadService } from '../upload/upload.service';
import { SiteTestimonial } from './entity/site-testimonial.entity';
import { SiteSetting } from 'src/site-setting/entity/site-setting.entity';
import { User } from 'src/user/entities/user.entity';
import { UpdateSiteTestimonialDto } from './dto/update-site-testimonial.dto';
import { Upload } from 'src/backblaze/entity/upload.entity';
export declare class SiteTestimonialService {
    private readonly testimonialRepository;
    private readonly siteSettingRepository;
    private readonly usersRepository;
    private readonly uploadRepository;
    private readonly uploadService;
    constructor(testimonialRepository: Repository<SiteTestimonial>, siteSettingRepository: Repository<SiteSetting>, usersRepository: Repository<User>, uploadRepository: Repository<Upload>, uploadService: UploadService);
    create(userId: string, createDto: CreateSiteTestimonialDto, file: Express.Multer.File): Promise<SiteTestimonial>;
    update(testimonialId: string, userId: string, updateDto: UpdateSiteTestimonialDto, file?: Express.Multer.File): Promise<SiteTestimonial>;
    findOne(id: string): Promise<SiteTestimonial | null>;
    findByUserId(userId: string): Promise<SiteTestimonial[]>;
    selectTestimonialById(id: string): Promise<SiteTestimonial>;
    selectMultipleTestimonialsByIds(ids: string[]): Promise<SiteTestimonial[]>;
}
