import nodemailer from 'nodemailer';
import config from './index';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: {
      user: config.mail.user,
      pass: config.mail.pass,
    },
  });
};

export default createTransporter;
