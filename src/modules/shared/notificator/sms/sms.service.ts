import { LoggerService } from '@nodesandbox/logger';
import {
  ErrorResponse,
  ErrorResponseType,
  SuccessResponseType,
} from '@nodesandbox/response-kit';
import { Twilio } from 'twilio';

const logger = LoggerService.getInstance();

class SmsService {
  private client;

  constructor() {
    this.client = new Twilio(
      CONFIG.sms.provider.accountSID,
      CONFIG.sms.provider.authToken,
    );
  }

  async sendSMS({
    to,
    message,
  }: {
    to: string;
    message: string;
  }): Promise<SuccessResponseType<void> | ErrorResponseType> {
    try {
      await this.client.messages.create({
        body: message,
        from: CONFIG.sms.phoneNumber,
        to: to,
      });

      return { success: true };
    } catch (error) {
      logger.error('Error sending email', error as Error);
      return {
        success: false,
        error: new ErrorResponse(
          'INTERNAL_SERVER_ERROR',
          'Failed to send sms',
          ['Please try again later.'],
          error as Error,
        ),
      };
    }
  }
}

export default new SmsService();
