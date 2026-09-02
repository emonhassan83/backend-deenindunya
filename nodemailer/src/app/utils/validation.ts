import { SendMailRequest } from '../@types';

export const validateMailRequest = (body: any): { valid: boolean; error?: string } => {
  const { to, subject, html } = body as SendMailRequest;

  if (!to) {
    return { valid: false, error: 'Recipient email (to) is required' };
  }

  if (!isValidEmail(to)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!subject) {
    return { valid: false, error: 'Subject is required' };
  }

  if (!html) {
    return { valid: false, error: 'HTML content is required' };
  }

  return { valid: true };
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
