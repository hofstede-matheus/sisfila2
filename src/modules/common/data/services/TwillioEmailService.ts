import { Injectable } from '@nestjs/common';
import { EmailService } from '../../domain/services/EmailService';
import sgMail from '@sendgrid/mail';

@Injectable()
export class TwillioEmailService implements EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`Sending email to ${to} with message: ${body}`);
    const msg = {
      to,
      from: process.env.SENDGRID_EMAIL,
      subject,
      html: body,
    };

    await sgMail.send(msg);
  }
}
