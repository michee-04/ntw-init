import {
  IEmailOptions,
  IEmailResponse,
  EmailError,
  EmailErrorCode,
} from './types';
import { EmailTemplate } from './templates';
import MailService from './mail.service';

class MailServiceUtilities {
  static async sendMail(options: IEmailOptions): Promise<IEmailResponse> {
    try {
      return await MailService.sendMail(options);
    } catch (error) {
      if (error instanceof EmailError) {
        throw error;
      }
      throw new EmailError(
        'Failed to send email',
        EmailErrorCode.PROVIDER_ERROR,
        true,
      );
    }
  }

  static async sendOtp({
    to,
    code,
    purpose,
  }: {
    to: string;
    code: string;
    purpose: string;
  }): Promise<IEmailResponse> {
    const otpPurpose = CONFIG.otp.purposes[purpose];
    if (!otpPurpose) {
      throw new EmailError(
        'Invalid OTP purpose provided',
        EmailErrorCode.TEMPLATE_NOT_FOUND,
        false,
      );
    }

    return await this.sendMail({
      to,
      template: EmailTemplate.OTP,
      data: {
        subject: otpPurpose.title,
        code,
        purpose: otpPurpose.message,
        expiresIn: CONFIG.otp.expiration / 60000,
        appName: CONFIG.app,
      },
    });
  }

  static async sendAccountCreationEmail({
    to,
    data,
  }: {
    to: string;
    data: {
      name: string;
      email: string;
      code: string;
    };
  }): Promise<IEmailResponse> {
    const options = {
      to,
      template: EmailTemplate.ACCOUNT_CREATION,
      data: {
        subject: 'Welcome to Our Service',
        ...data,
        appName: CONFIG.app,
        expiresIn: CONFIG.otp.expiration / 60000,
      },
    };
    return await this.sendMail(options);
  }

  static async sendPasswordResetEmail({
    to,
    data,
  }: {
    to: string;
    data: {
      name: string;
      code: string;
    };
  }): Promise<IEmailResponse> {
    return await this.sendMail({
      to,
      template: EmailTemplate.PASSWORD_RESET,
      data: {
        subject: 'Reset Your Password',
        ...data,
        appName: CONFIG.app,
        expiresIn: CONFIG.otp.expiration / 60000,
      },
    });
  }

  static async sendEmailVerification({
    to,
    data,
  }: {
    to: string;
    data: {
      name: string;
      code: string;
    };
  }): Promise<IEmailResponse> {
    return await this.sendMail({
      to,
      template: EmailTemplate.EMAIL_VERIFICATION,
      data: {
        subject: 'Verify Your Email',
        ...data,
        appName: CONFIG.app,
        expiresIn: CONFIG.otp.expiration / 60000,
      },
    });
  }
}

export default MailServiceUtilities;
