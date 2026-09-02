import { SendMailRequest } from '../@types';
import config from '../configs';

export const createMailOptions = (data: SendMailRequest) => {
  return {
    from: config.mail.from,
    to: data.to,
    subject: data.subject,
    text: data.text || '',
    html: data.html,
  };
};
