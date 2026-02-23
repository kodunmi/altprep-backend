import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';
import { User } from '@api/models/User';
import { PasswordReset } from '@api/models/PasswordReset';
import { addMinutes } from 'date-fns';
import { UserNotFound } from '@base/api/exceptions/Auth/InvalidCredentials';
import { randomIntegers } from '@base/utils/string';
import { authConfig } from '@base/config/auth';
import { HashService } from '@base/infrastructure/services/hash/HashService';
import { SmtpProvider } from '@base/infrastructure/services/mail/Providers/SmtpProvider';
import { EmailNotificationTemplateEnum } from '@base/infrastructure/services/mail/Interfaces/templateInterface';
import { MailService } from '@base/infrastructure/services/mail/MailService';

@Service()
export class PasswordResetService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(PasswordReset) private resetRepo: Repository<PasswordReset>,
  ) {}

  public async requestReset(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UserNotFound();

    const token = randomIntegers(4);
    // remove any existing tokens
    this.resetRepo.findOne({ where: { email } }).then((reset) => reset && this.resetRepo.remove(reset));

    await this.resetRepo.save({
      email,
      token,
      expires_at: addMinutes(new Date(), authConfig.resetTokenExpiresIn),
    });

    await new MailService()
      .to(email)
      .subject('Password Reset Code')
      .htmlView(EmailNotificationTemplateEnum.reset_password, { name: 'John Doe', expires: authConfig.resetTokenExpiresIn, token })
      .send();

    return { message: 'Password reset email sent. Please check your inbox.' };
  }

  public async reset(token: string, newPassword: string) {
    const reset = await this.resetRepo.findOne({ where: { token } });
    if (!reset || reset.expires_at < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    const user = await this.userRepo.findOne({ where: { email: reset.email } });
    if (!user) throw new UserNotFound();

    user.password = await new HashService().make(newPassword);
    await this.userRepo.save(user);

    // remove token so it cannot be reused
    await this.resetRepo.remove(reset);

    return { message: 'Password reset successful' };
  }
}
