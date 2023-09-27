export interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

export const EmailService = Symbol('EmailService');
