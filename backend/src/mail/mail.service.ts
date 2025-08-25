import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private isDevelopment: boolean;

  constructor(@Inject(ConfigService) private configService: ConfigService) {
    this.isDevelopment = this.configService.get("NODE_ENV") !== "production";

    // Get SMTP configuration from environment variables
    const mailHost = this.configService.get("MAIL_HOST");
    const mailPort = this.configService.get("MAIL_PORT");
    const mailUser = this.configService.get("MAIL_USER");
    const mailPassword = this.configService.get("MAIL_PASSWORD");

    if (mailHost && mailPort && mailUser && mailPassword) {
      try {
        // Create SMTP transport with the configuration
        this.transporter = nodemailer.createTransport({
          host: mailHost,
          port: parseInt(mailPort, 10),
          secure: mailPort === "465", // true for 465, false for other ports
          auth: {
            user: mailUser,
            pass: mailPassword,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        this.logger.log(`Email transport configured with SMTP: ${mailHost}:${mailPort}`, "constructor");
      } catch (error) {
        this.logger.error(`Failed to configure email transport: ${error.message}`, "constructor");
        this.setupMockTransport();
      }
    } else {
      this.logger.warn("SMTP configuration incomplete, using mock transport", "constructor");
      this.setupMockTransport();
    }
  }

  private setupMockTransport() {
    // Create a mock transport that doesn't actually send emails
    this.transporter = {
      sendMail: async (mailOptions) => {
        this.logger.debug(
          `[MOCK EMAIL] To: ${mailOptions.to}, Subject: ${mailOptions.subject}`,
          "setupMockTransport.sendMail"
        );
        this.logger.debug(`Would send email with token URL included.`, "setupMockTransport.sendMail");
        return Promise.resolve({ messageId: `mock-${Date.now()}@localhost` });
      },
    } as any;
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    try {
      const appUrl = this.configService.get("FRONTEND_URL") || "http://localhost:6000";
      const verificationUrl = `${appUrl}/verify-account/${token}`;

      if (this.isDevelopment) {
        this.logger.debug(`Verification token: ${token}`, "sendVerificationEmail");
        this.logger.debug(`Verification URL: ${verificationUrl}`, "sendVerificationEmail");
      }

      await this.transporter.sendMail({
        from: this.configService.get("MAIL_FROM") || "noreply@example.com",
        to,
        subject: "Verify Your Email Address",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with our Chatbot Platform. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
            </div>
            <p>If you didn't create an account, you can safely ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
            <p>Best regards,<br>The Chatbot Platform Team</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`, "sendVerificationEmail");
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    try {
      const appUrl = this.configService.get("FRONTEND_URL") || "http://localhost:6000";
      const resetUrl = `${appUrl}/reset-password/${token}`;

      await this.transporter.sendMail({
        from: this.configService.get("MAIL_FROM") || "noreply@example.com",
        to,
        subject: "Reset Your Password",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #2196F3; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
            <p>Best regards,<br>The Chatbot Platform Team</p>
          </div>
        `,
      });

      if (this.isDevelopment) {
        this.logger.debug(`Reset token: ${token}`, "sendPasswordResetEmail");
        this.logger.debug(`Reset URL: ${resetUrl}`, "sendPasswordResetEmail");
      }
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`, "sendPasswordResetEmail");
      // Don't rethrow the error
    }
  }
}
