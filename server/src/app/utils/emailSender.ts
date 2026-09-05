import axios from 'axios';
import httpStatus from 'http-status'
import AppError from '../errors/AppError';

const mailServiceUrl = process.env.MAIL_SERVICE_URL || 'https://deeninduniya.vercel.app/'

const emailSender = async (email: string, subject: string, html: string) => {
 try {
    const emailData = {
      to: email,
      subject,
      html,
    };

    const res = await axios.post(
      mailServiceUrl,
      emailData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const result = res?.data;
    if (!result.success) {
      throw new AppError(httpStatus.BAD_REQUEST, result.message);
    }
    return result;
  } catch (error: any) {
    console.error('Email sending error:', {
      message: error.message,
      status: error.response?.status,
      response: error.response?.data,
    });
    throw new AppError(
      httpStatus.BAD_REQUEST,
      error.response?.data?.message || 'Error sending email',
    );
  }
}

export default emailSender
