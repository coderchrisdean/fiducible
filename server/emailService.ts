import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

export class EmailService {
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@fiducible.com';
  }

  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  getVerificationUrl(token: string): string {
    const baseUrl = process.env.REPLIT_DOMAINS ? 
      `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
      'http://localhost:5173';
    return `${baseUrl}/verify-email?token=${token}`;
  }

  async sendVerificationEmail(email: string, name: string, token: string): Promise<void> {
    const verificationUrl = this.getVerificationUrl(token);
    
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: 'Verify your Fiducible account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Fiducible!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for signing up for Fiducible. To complete your registration, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create this account, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This email was sent by Fiducible. Please do not reply to this email.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendCaseInvitationEmail(email: string, inviterName: string, caseName: string, token: string): Promise<void> {
    const invitationUrl = `${this.getVerificationUrl('')}/invitations/${token}/accept`;
    
    try {
      await resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `Invitation to collaborate on ${caseName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">You've been invited to collaborate</h2>
            <p>Hi there,</p>
            <p>${inviterName} has invited you to collaborate on the case "${caseName}" in Fiducible.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${invitationUrl}</p>
            <p>This invitation will expire in 7 days.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #666; font-size: 12px;">This email was sent by Fiducible. Please do not reply to this email.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      throw new Error('Failed to send invitation email');
    }
  }
}

export const emailService = new EmailService();