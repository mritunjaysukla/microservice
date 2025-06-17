"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailService = void 0;
const common_1 = require("@nestjs/common");
const resend_1 = require("src/utils/resend");
let SendEmailService = class SendEmailService {
    constructor() {
        this.from = 'Fotosfolio <no-reply@fotosfolio.com>';
    }
    async sendEmail(to, subject, text, html) {
        try {
            await resend_1.default.emails.send({
                from: this.from,
                to: to.toLowerCase(),
                subject,
                text,
                html,
            });
        }
        catch (error) {
            console.error(`❌ Error sending email to ${to}:`, error);
        }
    }
    async sendAccountCreatedMail(to, username) {
        const subject = 'Welcome to Fotosfolio – Your Account Is Ready!';
        const text = `Hi ${username},\n\nWelcome to Fotosfolio! Your account has been created. Start showcasing your photography and connect with a creative community today.\n\nThanks for joining!\n\n– The Fotosfolio Team`;
        const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Welcome to Fotosfolio, ${username}!</h2>
        <p>Your account has been created. We're thrilled to have you with us.</p>
        <p>Start showcasing your photography and meet other creatives.</p>
        <p>– The Fotosfolio Team</p>
      </div>`;
        await this.sendEmail(to, subject, text, html);
    }
    async sendSubscriptionCreatedEmail(to, userName, planName, startDate, endDate, status) {
        const subject = 'Your Subscription Has Been Created Successfully';
        const text = `Hi ${userName},\n\nYour subscription for the ${planName} plan has been created.\nStart: ${startDate}\nEnd: ${endDate}\nStatus: ${status}\n\nComplete your payment to activate it.\n\n– Fotosfolio Team`;
        const html = `<div style="font-family: Arial, sans-serif;">
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your subscription for the <strong>${planName}</strong> plan has been created.</p>
      <ul>
        <li><strong>Start Date:</strong> ${startDate}</li>
        <li><strong>End Date:</strong> ${endDate}</li>
        <li><strong>Status:</strong> ${status}</li>
      </ul>
      <p>Complete your payment in your dashboard to activate it.</p>
      <p>– Fotosfolio Team</p>
    </div>`;
        await this.sendEmail(to, subject, text, html);
    }
    async sendPaymentSuccessEmail(to, userName, planName) {
        const subject = 'Payment Received – Pending Activation';
        const text = `Hi ${userName},\n\nWe received your payment for the ${planName} plan. Your account will be activated shortly.\n\n– Fotosfolio Team`;
        const html = `<div style="font-family: Arial, sans-serif;">
      <p>Hi <strong>${userName}</strong>,</p>
      <p>We received your payment for the <strong>${planName}</strong> plan.</p>
      <p>Your account will be activated shortly.</p>
      <p>– Fotosfolio Team</p>
    </div>`;
        await this.sendEmail(to, subject, text, html);
    }
    async sendAccountActivationEmail(to, userName, planName) {
        const subject = 'Your Account is Now Active! 🎉';
        const text = `Hi ${userName},\n\nYour ${planName} plan is now active! Log in and start using Fotosfolio.\n\n– Fotosfolio Team`;
        const html = `<div style="font-family: Arial, sans-serif;">
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your <strong>${planName}</strong> plan is now active!</p>
      <p>Login and explore your dashboard.</p>
      <p>– Fotosfolio Team</p>
    </div>`;
        await this.sendEmail(to, subject, text, html);
    }
    async sendPaymentRejectionEmail(to, userName, planName) {
        const subject = 'Payment Rejected – Action Required';
        const text = `Hi ${userName},\n\nWe couldn't process your payment for the ${planName} plan. Please review and try again.\n\n– Fotosfolio Team`;
        const html = `<div style="font-family: Arial, sans-serif;">
      <p>Hi <strong>${userName}</strong>,</p>
      <p>We couldn't process your payment for the <strong>${planName}</strong> plan.</p>
      <p>Please try again or contact support.</p>
      <p>– Fotosfolio Team</p>
    </div>`;
        await this.sendEmail(to, subject, text, html);
    }
    async sendOtpEmail(to, userName, otpCode) {
        console.log(to, userName, otpCode);
        const subject = 'Your OTP Code for Secure Access';
        const text = `Hi ${userName},\n\nYour OTP is: ${otpCode}\n\nValid for 10 minutes.\n\n– Fotosfolio Team`;
        const html = `<div style="font-family: Arial, sans-serif;">
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your OTP code is:</p>
      <h2>${otpCode}</h2>
      <p>It is valid for 10 minutes. Please don’t share it.</p>
      <p>– Fotosfolio Team</p>
    </div>`;
        await this.sendEmail(to, subject, text, html);
    }
    async sendOtpVerifiedEmail(to, userName) {
        const subject = 'OTP Verification Successful';
        const text = `Hi ${userName},\n\nYour OTP was verified. You may proceed securely.\n\n– Fotosfolio Team`;
        const html = `<div style="font-family: Arial, sans-serif;">
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your OTP has been verified successfully.</p>
      <p>You may now continue securely.</p>
      <p>– Fotosfolio Team</p>
    </div>`;
        await this.sendEmail(to, subject, text, html);
    }
    async sendSubscriptionExpirationReminderEmail(to, userName, daysRemaining) {
        const subject = 'Subscription Expiration Reminder';
        const text = `Hi ${userName},\n\nYour subscription will expire in ${daysRemaining} day(s). Please renew to continue using Fotosfolio.\n\n– Fotosfolio Team`;
        const html = `<div style="font-family: Arial, sans-serif;">
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your subscription will expire in <strong>${daysRemaining}</strong> day(s).</p>
      <p>Please renew to avoid disruption.</p>
      <p>– Fotosfolio Team</p>
    </div>`;
        await this.sendEmail(to, subject, text, html);
    }
    async sendPasswordResetMail(to, username, resetLink) {
        const subject = 'Reset Your Fotosfolio Password';
        const text = `Hi ${username},\n\nWe received a request to reset your password for your Fotosfolio account. Click the link below to set a new password:\n\n${resetLink}\n\nIf you didn’t request a password reset, you can safely ignore this email.\n\n– The Fotosfolio Team`;
        const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Hello ${username},</h2>
        <p>We received a request to reset your Fotosfolio password.</p>
        <p>Click the button below to choose a new password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">Reset Password</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p><a href="${resetLink}" style="color: #007bff;">${resetLink}</a></p>
        <p>If you didn't request this, feel free to ignore this email.</p>
        <p>– The Fotosfolio Team</p>
      </div>
    `;
        await this.sendEmail(to, subject, text, html);
    }
    async sendLoginNotificationEmail(to, userName, loginTime, ipAddress) {
        const subject = 'New Login to Your Fotosfolio Account';
        const formattedDate = loginTime.toLocaleString();
        const text = `Hi ${userName},\n\nWe noticed a new login to your Fotosfolio account.\nTime: ${formattedDate}\n${ipAddress ? `IP Address: ${ipAddress}\n` : ''}${location ? `Location: ${location}\n` : ''}\n\nIf this was you, you can safely ignore this message.\nIf you didn’t authorize this login, please reset your password immediately.\n\n– Fotosfolio Team`;
        const html = `<div style="font-family: Arial, sans-serif;">
      <p>Hi <strong>${userName}</strong>,</p>
      <p>We noticed a new login to your <strong>Fotosfolio</strong> account.</p>
      <ul>
        <li><strong>Time:</strong> ${formattedDate}</li>
        ${ipAddress ? `<li><strong>IP Address:</strong> ${ipAddress}</li>` : ''}

      </ul>
      <p>If this was you, you can safely ignore this message.</p>
      <p>If you didn’t authorize this login, please <a href="https://yourdomain.com/reset-password" style="color: #007BFF;">reset your password</a> immediately.</p>
      <p>– Fotosfolio Team</p>
    </div>`;
        await this.sendEmail(to, subject, text, html);
    }
};
SendEmailService = __decorate([
    (0, common_1.Injectable)()
], SendEmailService);
exports.SendEmailService = SendEmailService;
//# sourceMappingURL=send-email.service.js.map