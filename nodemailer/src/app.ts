import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import createTransporter from './app/configs/transporter';
import config from './app/configs';
import { createMailOptions, validateMailRequest } from './app/utils';
import { SendMailRequest, SendMailResponse } from './app/@types';

const app: Application = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.send('Deenindunya Nodemailer Service is running!');
});

// Send email endpoint
app.post('/', async (req: Request, res: Response<SendMailResponse>) => {
  // Validate request
  const validation = validateMailRequest(req.body);
  if (!validation.valid) {
    res.status(400).json({
      success: false,
      message: validation.error || 'Validation failed',
    });
    return;
  }

  const { to, subject, html, text } = req.body as SendMailRequest;

  try {
    const transporter = createTransporter();
    const mailOptions = createMailOptions({ to, subject, html, text });

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully.',
    });
  } catch (error: any) {
    console.error('Error sending email:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to send email.',
      error: error.message,
      stack: config.nodeEnv === 'development' ? error.stack : undefined,
    });
  }
});

export default app;
