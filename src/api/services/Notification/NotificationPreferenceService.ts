import { NotificationTypeEnum } from '@base/api/interfaces/notification/NotificationInterface';
import { NotificationPreference } from '@base/api/models/NotificationPreference';
import { User } from '@base/api/models/User';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class NotificationPreferenceService {
  constructor(@InjectRepository(NotificationPreference) private preferenceRepo: Repository<NotificationPreference>) {}

  async initializeUserPreferences(userId: number) {
    const existing = await this.preferenceRepo.find({
      where: { user_id: userId },
    });

    const existingTypes = existing.map((e) => e.type);

    const missingTypes = (Object.values(NotificationTypeEnum) as NotificationTypeEnum[]).filter((type) => !existingTypes.includes(type));

    if (!missingTypes.length) return;

    const newPrefs = missingTypes.map((type) =>
      this.preferenceRepo.create({
        user_id: userId,
        type,
        enabled: true,
        created_at: new Date(),
        updated_at: new Date(),
      }),
    );

    await this.preferenceRepo.save(newPrefs);
  }

  async listUserPreferences(userId: number) {
    const existing = await this.preferenceRepo.find({
      where: { user_id: userId },
      select: ['type', 'enabled'],
    });

    return existing;
  }

  async update(userId: number, type: NotificationTypeEnum, enabled: boolean) {
    let pref = await this.preferenceRepo.findOne({
      where: { user: { id: userId }, type },
    });

    if (!pref) {
      pref = this.preferenceRepo.create({
        user_id: userId,
        type,
        enabled,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } else {
      pref.enabled = enabled;
      pref.updated_at = new Date();
    }

    return this.preferenceRepo.save(pref);
  }

  async isEnabled(userId: string, type: NotificationTypeEnum): Promise<boolean> {
    const pref = await this.preferenceRepo.findOne({
      where: { user: { id: userId }, type },
    });

    return pref?.enabled ?? true;
  }
}
