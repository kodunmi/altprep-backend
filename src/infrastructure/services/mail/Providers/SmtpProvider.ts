import * as nodeMailer from 'nodemailer';
import { mailConfig } from '@base/config/mail';
import edge from 'edge.js'
import { join } from 'path';
import { BadRequestError } from 'routing-controllers';

export enum EmailNotificationTemplateEnum {
  reset_password = 'password_reset',
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
  public constructor() {
    this.transporter = nodeMailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      auth: {
        user: mailConfig.authUser,
        pass: mailConfig.authPassword,
      },
    });

    edge.mount(join(__dirname, '../../../../views/emails'));
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

    /** Load and render Edge template from views/emails */
  public htmlView(template: EmailNotificationTemplateEnum, data: Record<string, any>) {
    this.templateName = template;
    this.templateData = data;
    return this
  }

  public async send() {
    if (this.templateName) {
      this.htmlValue = await edge.render(this.templateName, this.templateData);
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
