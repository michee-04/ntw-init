import { MailServiceUtilities } from './mail';
import { SmsServiceUtilities } from './sms';

export const Notificator = {
  mail: MailServiceUtilities,
  sms: SmsServiceUtilities,
};

export class NotifyByOtp {
  static async send({
    to,
    code,
    purpose,
  }: {
    to: string;
    code: string;
    purpose: string;
  }): Promise<void> {
    try {
      await Promise.all([
        Notificator.sms.sendSmsOtp({ to, code }),
        Notificator.mail.sendMailOtp({ to, code, purpose }),
      ]);

      LOGGER.info(
        'Envoie des notifications sur tous les canaux reussi avec succes',
      );
    } catch (error) {
      LOGGER.error("Erreur lors de l'envoi des notifications: ", error);
    }
  }
}
