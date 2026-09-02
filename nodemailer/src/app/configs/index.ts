import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mail: {
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.NODE_ENV === 'production',
    user: process.env.NODEMAILLER_HOST_MAIL || '',
    pass: process.env.NODEMAILLER_HOST_PASS || '',
    from: process.env.MAIL_FROM || 'thirdshotslot@gmail.com',
  },
};

export default config;
