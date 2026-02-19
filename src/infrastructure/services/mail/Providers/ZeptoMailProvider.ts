import { mailConfig } from '@base/config/mail';
import { SendMailClient } from 'zeptomail';
import { join } from 'path';
import { BadRequestError } from 'routing-controllers';
import * as Handlebars from 'handlebars';
import { readFileSync } from 'fs';


export enum EmailNotificationTemplateEnum {
  reset_password = 'password_reset',
  paymentReceipt = 'payment_receipt'
}

export class ZeptoMailProvider {
  private client: SendMailClient;

  private fromValue: string;
  private toValue: string | string[];
  private subjectValue: string;
  private textValue?: string;
  private htmlValue?: string;
  private templateData: Record<string, any>;
  private templateName: EmailNotificationTemplateEnum;
  private edge: any;

  constructor() {
    this.client = new SendMailClient({
      url: mailConfig.zeptoMailUrl,
      token: mailConfig.zeptoMailToken,
    });

    this.fromValue = `"${mailConfig.fromName}" <${mailConfig.fromEmail}>`;
  }

  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  private getTemplate(templateName: string): HandlebarsTemplateDelegate {
    if (!this.templateCache.has(templateName)) {
      const templatePath = join(__dirname, '../../../../views/emails', `${templateName}.hbs`);
      const templateSource = readFileSync(templatePath, 'utf-8');
      const template = Handlebars.compile(templateSource);
      this.templateCache.set(templateName, template);
    }
    return this.templateCache.get(templateName)!;
  }

  public from(value: string): this {
    this.fromValue = value;
    return this;
  }

  public to(value: string | string[]): this {
    this.toValue = value;
    return this;
  }

  public subject(value: string): this {
    this.subjectValue = value;
    return this;
  }

  public text(value: string): this {
    this.textValue = value;
    return this;
  }

  public html(value: string): this {
    this.htmlValue = value;
    return this;
  }

  public htmlView(template: EmailNotificationTemplateEnum, data: Record<string, any>): this {
    this.templateName = template;
    this.templateData = data;
    return this;
  }

  public async send(): Promise<any> {
   if (this.templateName) {
      const template = this.getTemplate(this.templateName);
      this.htmlValue = template(this.templateData);
    }
    
    if (!this.toValue || !this.subjectValue) {
      throw new BadRequestError('Email provider not initialized. Use to() and subject() first.');
    }

    console.log('Sending email via ZeptoMail API');

    // ZeptoMail expects "to" as array of objects
    const toArray = Array.isArray(this.toValue)
      ? this.toValue.map((email) => ({ email_address: { address: email } }))
      : [{ email_address: { address: this.toValue } }];

    const payload: any = {
      from: { address: mailConfig.fromEmail, name: mailConfig.fromName },
      to: toArray,
      subject: this.subjectValue,
    };

    if (this.htmlValue) {
      payload.htmlbody = this.htmlValue;
    }
    if (this.textValue) {
      payload.textbody = this.textValue;
    }

    const mailOptionsLog = { ...payload, to: this.toValue };
    console.log('Sending Email [Details]: ', mailOptionsLog);

    try {
      const result = await this.client.sendMail(payload);
      console.log('Email sent successfully via ZeptoMail:', result);
      return result;
    } catch (error: any) {
      console.error('Failed to send email via ZeptoMail:', {
        message: error.message,
        response: error.response?.data,
        to: this.toValue,
        subject: this.subjectValue,
        errorDetail: error.error?.details ? ` ${JSON.stringify(error.error.details)}` : '',
      });
      throw error;
    }
  }
}