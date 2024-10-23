/* eslint-disable prettier/prettier */
import {
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import smsService from './sms.service';

class SmsServiceUtilities {
  static async sendSmsOtp({
    to,
    code,
  }: {
    to: string;
    code: string;
  }): Promise<SuccessResponseType<void> | ErrorResponseType> {
    const message = `\n ${code}\n\nThis code is valid for ${
      CONFIG.otp.expiration / 60000
    } minutes.`;

    return await smsService.sendSMS({ to, message });
  }

  static async sendAccountCreationEmail({
    to,
  }: {
    to: string;
  }): Promise<SuccessResponseType<void> | ErrorResponseType> {
    const message = 'Welcome to Our Service';

    return await smsService.sendSMS({
      to,
      message,
    });
  }
}

export default SmsServiceUtilities;
