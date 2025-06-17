import { ConfigService } from '@nestjs/config';
import Mail from 'nodemailer/lib/mailer';
type MailOptions = Mail.Options;
export declare class MailService {
    private readonly configService;
    private readonly fromValue;
    private transport;
    constructor(configService: ConfigService);
    send(options: MailOptions): Promise<string>;
    from(): string;
}
export {};
