export interface SendMailRequest {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendMailResponse {
  success: boolean;
  message: string;
  error?: string;
  stack?: string;
}

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EnvConfig {
  port: number;
  nodeEnv: string;
  mail: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
}
