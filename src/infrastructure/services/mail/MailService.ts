import { Service } from 'typedi';
import { mailConfig } from '@base/config/mail';
import { join } from 'path';
import { BadRequestError } from 'routing-controllers';
import * as Handlebars from 'handlebars';
import { readFileSync } from 'fs';

import { SmtpProvider } from './Providers/SmtpProvider';
import { ZeptoMailProvider } from './Providers/ZeptoMailProvider';
import { EmailNotificationTemplateEnum } from './Interfaces/templateInterface';

// Keep only the sending part in providers (see below)
type ProviderType = 'smtp' | 'zeptomail';

@Service()
export class MailService {
  private provider: SmtpProvider | ZeptoMailProvider;

  // Builder state (moved from providers)
  private fromValue: string = `"${mailConfig.fromName}" <${mailConfig.fromEmail}>`;
  private toValue?: string | string[];
  private subjectValue?: string;
  private textValue?: string;
  private htmlValue?: string;

  private templateName?: EmailNotificationTemplateEnum;
  private templateData?: Record<string, any>;

  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.setProvider(mailConfig.provider as ProviderType);
  }

  public setProvider(providerName: ProviderType): this {
    switch (providerName) {
      case 'smtp':
        this.provider = new SmtpProvider();
        break;
      case 'zeptomail':
        this.provider = new ZeptoMailProvider();
        break;
      default:
        throw new Error(`Unsupported mail provider: ${providerName}`);
    }
    return this;
  }

  // ── Fluent setters ────────────────────────────────────────

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

  // ── Send ──────────────────────────────────────────────────

  public async send(): Promise<any> {
    console.info('[MailService] Sending email', {
      to: this.toValue,
      subject: this.subjectValue,
      provider: this.provider.constructor.name,
    });
    if (!this.toValue || !this.subjectValue) {
      console.log('[Email error]: Email not properly configured: to and subject are required.');

      // throw new BadRequestError('Email not properly configured: to and subject are required.');
    }

    // Render template if used
    if (this.templateName) {
      const template = this.getTemplate(this.templateName);
      this.htmlValue = template(this.templateData!);
    }

    try {
      // Delegate only the final sending
      await this.provider.sendMail({
        from: this.fromValue,
        to: this.toValue,
        subject: this.subjectValue,
        text: this.textValue,
        html: this.htmlValue,
      });

      console.info('[MailService] Email sent successfully', {
        to: this.toValue,
        subject: this.subjectValue,
        provider: this.provider.constructor.name,
      });
    } catch (error) {
      console.log('[Email Sending failed]', {
        Provider: this.provider,
        error: error,
      });
    }
  }

  private getTemplate(templateName: EmailNotificationTemplateEnum): HandlebarsTemplateDelegate {
    const key = templateName; // or String(templateName)
    if (!this.templateCache.has(key)) {
      const templatePath = join(__dirname, '../../../views/emails', `${templateName}.hbs`);
      const source = readFileSync(templatePath, 'utf-8');
      const compiled = Handlebars.compile(source);
      this.templateCache.set(key, compiled);
    }
    return this.templateCache.get(key)!;
  }
}
