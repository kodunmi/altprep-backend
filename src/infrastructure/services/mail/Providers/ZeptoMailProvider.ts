import { mailConfig } from '@base/config/mail';
import { SendMailClient } from 'zeptomail';
import { join } from 'path';
import { BadRequestError } from 'routing-controllers';
import * as Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { EmailNotificationTemplateEnum } from '../Interfaces/templateInterface';

export class ZeptoMailProvider {
  private client: SendMailClient;

  constructor() {
    this.client = new SendMailClient({
      url: mailConfig.zeptoMailUrl,
      token: mailConfig.zeptoMailToken,
    });
  }

  async sendMail(options: { from: string; to: string | string[]; subject: string; text?: string; html?: string }) {
    const toArray = Array.isArray(options.to)
      ? options.to.map((email) => ({ email_address: { address: email } }))
      : [{ email_address: { address: options.to } }];

    const payload: any = {
      from: { address: mailConfig.fromEmail, name: mailConfig.fromName },
      to: toArray,
      subject: options.subject,
    };

    if (options.html) payload.htmlbody = options.html;
    if (options.text) payload.textbody = options.text;

    try {
      return await this.client.sendMail(payload);
    } catch (error: any) {
      console.error('ZeptoMail send failed:', error);

      console.error('Failed to send email via ZeptoMail:', {
        message: error.message,
        response: error.response?.data,

        options,
        error: error,
        errorDetail: error.error?.details ? ` ${JSON.stringify(error.error.details)}` : '',
      });
      throw error;
    }
  }
}
