import { mailConfig } from '@base/config/mail';
import { Service } from 'typedi';
import { SmtpProvider } from './Providers/SmtpProvider';
import { ZeptoMailProvider } from './Providers/ZeptoMailProvider';
import { MailInterface } from './Interfaces/MailInterface';

@Service()
export class MailService implements MailInterface {
  private provider: SmtpProvider | ZeptoMailProvider;

  public constructor() {
    this.setProvider(mailConfig.provider);
  }

  public setProvider(provider: string) {
    switch (provider) {
      case 'smtp':
        this.provider = new SmtpProvider();
        break;
      
      case 'zeptomail':
        this.provider = new ZeptoMailProvider();
        break;

      default:
        throw new Error(`Unsupported mail provider: ${provider}`);
    }

    return this;
  }

  public from(value: string): this {
    this.provider.from(value);
    return this;
  }

  public to(value: string): this {
    this.provider.to(value);
    return this;
  }

  public subject(value: string): this {
    this.provider.subject(value);
    return this;
  }

  public text(value: string): this {
    this.provider.text(value);
    return this;
  }

  public html(value: string): this {
    this.provider.html(value);
    return this;
  }

  public async send(): Promise<any> {
    return await this.provider.send();
  }
}