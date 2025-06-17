export declare class SendEmailService {
    private readonly from;
    private sendEmail;
    sendAccountCreatedMail(to: string, username: string): Promise<void>;
    sendSubscriptionCreatedEmail(to: string, userName: string, planName: string, startDate: Date, endDate: Date, status: string): Promise<void>;
    sendPaymentSuccessEmail(to: string, userName: string, planName: string): Promise<void>;
    sendAccountActivationEmail(to: string, userName: string, planName: string): Promise<void>;
    sendPaymentRejectionEmail(to: string, userName: string, planName: string): Promise<void>;
    sendOtpEmail(to: string, userName: string, otpCode: string): Promise<void>;
    sendOtpVerifiedEmail(to: string, userName: string): Promise<void>;
    sendSubscriptionExpirationReminderEmail(to: string, userName: string, daysRemaining: string): Promise<void>;
    sendPasswordResetMail(to: string, username: string, resetLink: string): Promise<void>;
    sendLoginNotificationEmail(to: string, userName: string, loginTime: Date, ipAddress?: string): Promise<void>;
}
