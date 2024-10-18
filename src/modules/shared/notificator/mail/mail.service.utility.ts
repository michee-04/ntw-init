import { ErrorResponse } from 'handlers';
import { ErrorResponseType, SuccessResponseType } from 'types';
import MailService from './mail.service';

class MailServiceUtilities {
  static async sendOtp({
    to,
    code,
    purpose,
  }: {
    to: string;
    code: string;
    purpose: string;
  }): Promise<SuccessResponseType<void> | ErrorResponseType> {
    const otpPurpose = CONFIG.otp.purposes[purpose];
    if (!otpPurpose) {
      return {
        success: false,
        error: new ErrorResponse('BAD_REQUEST', 'Invalid OTP purpose provided'),
      };
    }

    const subject = otpPurpose.title;
    const text = `${otpPurpose.message} ${code}\n\nThis code is valid for ${
      CONFIG.otp.expiration / 60000
    } minutes.`;

    return await MailService.sendMail({ to, subject, text });
  }

  static async sendAccountCreationEmail({
    to,
    firstname,
  }: {
    to: string;
    firstname: string;
  }): Promise<SuccessResponseType<void> | ErrorResponseType> {
    const subject = 'Welcome to Our Service';
    const htmlTemplate = 'welcome';
    const templateData = { firstname };

    return await MailService.sendMail({
      to,
      subject,
      htmlTemplate,
      templateData,
    });
  }
}

export default MailServiceUtilities;
