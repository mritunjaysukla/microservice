"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const user_module_1 = require("./user/user.module");
const config_1 = require("@nestjs/config");
const db_module_1 = require("./db/db.module");
const configuration_1 = require("./services/app-config/configuration");
const app_cache_module_1 = require("./app-cache/app-cache.module");
const logger_module_1 = require("./logger/logger.module");
const async_storage_middleware_1 = require("./global/middleware/async-storage/async-storage.middleware");
const global_module_1 = require("./global/global.module");
const health_module_1 = require("./health/health.module");
const faq_module_1 = require("./faq/faq.module");
const plan_module_1 = require("./plan/plan.module");
const discount_module_1 = require("./discount/discount.module");
const otp_module_1 = require("./otp/otp.module");
const subscription_module_1 = require("./subscription/subscription.module");
const payment_module_1 = require("./payment/payment.module");
const invoice_module_1 = require("./invoice/invoice.module");
const project_module_1 = require("./project/project.module");
const social_account_module_1 = require("./socialAccounts/social-account.module");
const feedback_module_1 = require("./feedback/feedback.module");
const upload_module_1 = require("./upload/upload.module");
const backblaze_module_1 = require("./backblaze/backblaze.module");
const folder_module_1 = require("./folder/folder.module");
const project_setting_module_1 = require("./project-setting/project-setting.module");
const gallery_setting_module_1 = require("./gallery-setting/gallery-setting.module");
const shared_user_module_1 = require("./shared-user/shared-user.module");
const storage_module_1 = require("./storage/storage.module");
const site_setting_module_1 = require("./site-setting/site-setting.module");
const products_module_1 = require("./products/products.module");
const cards_module_1 = require("./cards/cards.module");
const site_testimonial_module_1 = require("./site-testimonial/site-testimonial.module");
const site_portfolio_module_1 = require("./site-portfolio/site-portfolio.module");
const site_portfolio_images_module_1 = require("./site-portfolio-images/site-portfolio-images.module");
const short_urls_module_1 = require("./short-urls/short-urls.module");
const fav_folder_module_1 = require("./fav-folder/fav-folder.module");
const product_order_module_1 = require("./product-order/product-order.module");
const datahub_service_1 = require("./datahub/datahub.service");
const datahub_module_1 = require("./datahub/datahub.module");
const schedule_1 = require("@nestjs/schedule");
const project_cleanup_service_1 = require("./project-cleanup/project-cleanup.service");
const project_cleanup_module_1 = require("./project-cleanup/project-cleanup.module");
const kyc_verification_module_1 = require("./kyc-verification/kyc-verification.module");
const help_center_module_1 = require("./help-center/help-center.module");
const send_email_module_1 = require("./send-email/send-email.module");
const mail_service_1 = require("./global/services/mail/mail.service");
const passkey_auth_module_1 = require("./passkey-auth/passkey-auth.module");
const security_questions_module_1 = require("./security-questions/security-questions.module");
const linktree_controller_1 = require("./linktree/linktree.controller");
const linktree_module_1 = require("./linktree/linktree.module");
const notes_controller_1 = require("./notes/notes.controller");
const notes_module_1 = require("./notes/notes.module");
const tasks_module_1 = require("./tasks/tasks.module");
const notification_module_1 = require("./notification/notification.module");
const zip_controller_1 = require("./zip-microservices/src/zip/zip.controller");
const khalti_module_1 = require("./khalti/khalti.module");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(async_storage_middleware_1.AsyncStorageMiddleware).forRoutes('*');
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            global_module_1.GlobalModule,
            config_1.ConfigModule.forRoot({
                cache: true,
                load: [configuration_1.getConfig],
            }),
            db_module_1.DbModule,
            app_cache_module_1.AppCacheModule,
            user_module_1.UserModule,
            config_1.ConfigModule,
            logger_module_1.LoggerModule,
            health_module_1.HealthModule,
            folder_module_1.FolderModule,
            faq_module_1.FaqModule,
            plan_module_1.PlanModule,
            discount_module_1.DiscountModule,
            otp_module_1.OtpModule,
            subscription_module_1.SubscriptionModule,
            payment_module_1.PaymentModule,
            invoice_module_1.InvoiceModule,
            project_module_1.ProjectsModule,
            social_account_module_1.SocialAccountModule,
            feedback_module_1.FeedbackModule,
            upload_module_1.UploadModule,
            backblaze_module_1.BlackblazeModule,
            project_setting_module_1.ProjectSettingModule,
            project_setting_module_1.ProjectSettingModule,
            gallery_setting_module_1.GallerySettingModule,
            shared_user_module_1.SharedUserModule,
            storage_module_1.StorageModule,
            site_setting_module_1.SiteSettingModule,
            products_module_1.ProductsModule,
            cards_module_1.CardsModule,
            site_testimonial_module_1.SiteTestimonialModule,
            site_portfolio_module_1.SitePortfolioModule,
            site_portfolio_images_module_1.SitePortfolioImagesModule,
            short_urls_module_1.ShortUrlModule,
            fav_folder_module_1.FavFolderModule,
            product_order_module_1.ProductOrderModule,
            datahub_module_1.DatahubModule,
            schedule_1.ScheduleModule.forRoot(),
            project_cleanup_module_1.ProjectCleanupModule,
            kyc_verification_module_1.KycVerificationModule,
            help_center_module_1.HelpCenterModule,
            send_email_module_1.SendEmailModule,
            passkey_auth_module_1.PasskeyAuthModule,
            security_questions_module_1.SecurityQuestionsModule,
            linktree_module_1.LinktreeModule,
            notes_module_1.NotesModule,
            tasks_module_1.TasksModule,
            notification_module_1.NotificationModule,
            khalti_module_1.KhaltiModule,
        ],
        controllers: [linktree_controller_1.LinktreeController, notes_controller_1.NotesController, zip_controller_1.ZipController],
        providers: [datahub_service_1.DatahubService, project_cleanup_service_1.ProjectCleanupService, mail_service_1.MailService],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map