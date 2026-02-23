import * as nodeMailer from 'nodemailer';
import { mailConfig } from '@base/config/mail';
import { join } from 'path';
import { BadRequestError } from 'routing-controllers';
import * as Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { EmailNotificationTemplateEnum } from '../Interfaces/templateInterface';

// SmtpProvider.ts  (stripped down)
export class SmtpProvider {
  private transporter: nodeMailer.Transporter;

  constructor() {
    this.transporter = nodeMailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      auth: {
        user: mailConfig.authUser,
        pass: mailConfig.authPassword,
      },
    });
  }

  async sendMail(options: { from: string; to: string | string[]; subject: string; text?: string; html?: string }) {
    const mailOptions = {
      from: options.from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    return this.transporter.sendMail(mailOptions);
  }
}
