import { MailServiceUtilities } from './mail';
import { SmsServiceUtilities } from './sms';

export const Notificator = {
  mail: MailServiceUtilities,
  sms: SmsServiceUtilities,
};
