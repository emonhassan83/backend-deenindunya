import app from './app';
import config from './app/configs';
import { gracefulShutdown } from './app/utils';

const server = app.listen(config.port, () => {
  console.log(`🚀 Nodemailer service running on port ${config.port}`);
  console.log(`📧 Environment: ${config.nodeEnv}`);
});

// Handle graceful shutdown
gracefulShutdown(server);
