

import * as nodeMailer from 'nodemailer';
import { mailConfig } from '@base/config/mail';
import { join } from 'path';
import { BadRequestError } from 'routing-controllers';
import * as Handlebars from 'handlebars';
import { readFileSync } from 'fs';

export enum EmailNotificationTemplateEnum {
  reset_password = 'password_reset',
  paymentReceipt = 'payment_receipt'
}

export class SmtpProvider {
  private readonly transporter: nodeMailer.Transporter;
  private fromValue: string = mailConfig.fromName + ' ' + mailConfig.authUser;
  private toValue: string;
  private subjectValue: string;
  private textValue: string;
  private htmlValue: string;
  private templateData: Record<string, any>;
  private templateName: EmailNotificationTemplateEnum;
  private edge: any; // or import the proper type from edge.js

  public constructor() {
    this.transporter = nodeMailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      auth: {
        user: mailConfig.authUser,
        pass: mailConfig.authPassword,
      },
    });
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


  public from(value: string) {
    this.fromValue = value;
    return this;
  }

  public to(value: string) {
    this.toValue = value;
    return this;
  }

  public subject(value: string) {
    this.subjectValue = value;
    return this;
  }

  public text(value: string) {
    this.textValue = value;
    return this;
  }

  public html(value: string) {
    this.htmlValue = value;
    return this;
  }

  public htmlView(template: EmailNotificationTemplateEnum, data: Record<string, any>) {
    this.templateName = template;
    this.templateData = data;
    return this;
  }

  public async send() {
    if (this.templateName) {
      const template = this.getTemplate(this.templateName);
      this.htmlValue = template(this.templateData);
    }

    if (!this.toValue || !this.subjectValue) {
      throw new BadRequestError('Email provider not initialized. Use setTo() or setSubject() first.');
    }

    const mailOptions = {
      from: this.fromValue,
      to: this.toValue,
      subject: this.subjectValue,
      text: this.textValue,
      html: this.htmlValue,
    };

    return await this.transporter.sendMail(mailOptions);
  }
}