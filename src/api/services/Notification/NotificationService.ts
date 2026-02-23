import { Service } from 'typedi';
import { Repository, In } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Notification } from '@api/models/Notification';
import { BadRequestError, NotFoundError } from 'routing-controllers';
import { parseDateRange } from '@base/utils/date';
import { mailConfig } from '@base/config/mail';
import { NotificationFiltersQuery } from '@base/api/requests/Notification/NotificationRequest';
import { NotificationPreference } from '@base/api/models/NotificationPreference';
import { NotificationPreferenceService } from './NotificationPreferenceService';
import { NotificationTypeEnum } from '@base/api/interfaces/notification/NotificationInterface';
import { EmailNotificationTemplateEnum } from '@base/infrastructure/services/mail/Interfaces/templateInterface';
import { MailService } from '@base/infrastructure/services/mail/MailService'; // ← added

@Service()
export class NotificationService {
  private mailService: MailService;
  private fromValue: string = mailConfig.fromName + ' <' + mailConfig.fromEmail + '>';
  private dbPayload: any = {};

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,

    private preferenceService: NotificationPreferenceService,

    // Option A: best – let typedi inject MailService
    mailService: MailService,
  ) {
    this.mailService = mailService;
  }

  // ───────────────────────────────────────────────
  // All public chainable methods remain exactly the same in name and signature
  // ───────────────────────────────────────────────

  public setFrom(value: string) {
    this.fromValue = value;
    this.mailService.from(value);
    return this;
  }

  public setTo(to: { userId?: number; email?: string }) {
    const { userId, email } = to;

    if (!email) {
      throw new BadRequestError('Email is required when sending notification via email');
    }

    this.mailService.to(email);
    this.dbPayload.userId = Number(userId);
    return this;
  }

  public setSubject(subject: string) {
    this.mailService.subject(subject);
    this.dbPayload.title = subject;
    return this;
  }

  public setMessage(message: string) {
    this.mailService.text(message);
    this.mailService.html(`<p>${message}</p>`);
    this.dbPayload.message = message;
    return this;
  }

  public setCategory(category: NotificationTypeEnum) {
    this.dbPayload.category = category;
    return this;
  }

  public setDetails(details: Record<string, any>) {
    this.dbPayload.details = details;
    return this;
  }

  public useTemplate(template: EmailNotificationTemplateEnum, data: Record<string, any>) {
    this.mailService.htmlView(template, data);
    return this;
  }

  public async sendViaEmail() {
    if (!this.mailService['toValue'] || !this.mailService['subjectValue']) {
      // rough check – or improve later
      throw new BadRequestError('Email not fully configured. to() and subject() are required.');
    }

    this.mailService.from(this.fromValue); // ensure from is set last (override if needed)
    return await this.mailService.send();
  }

  public async sendToDB() {
    const { userId, title, category } = this.dbPayload;

    if (!userId || !title || !category) {
      throw new BadRequestError('userId, title and category are required');
    }

    const allowed = await this.preferenceService.isEnabled(userId, category);
    if (!allowed) return null;

    const entity = this.notificationRepo.create({
      user_id: userId,
      title,
      message: this.dbPayload.message,
      category,
      details: this.dbPayload.details ?? null,
      read: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return await this.notificationRepo.save(entity);
  }

  // ───────────────────────────────────────────────
  // The rest of your methods remain completely unchanged
  // ───────────────────────────────────────────────

  public async getAll(userId: number, filters: NotificationFiltersQuery) {
    const { category, range, status, search, limit = 20, offset = 0, order = 'newest' } = filters;

    const qb = this.notificationRepo.createQueryBuilder('n').where('n.user_id = :userId', { userId });

    if (category) qb.andWhere('n.category = :category', { category });

    if (status) qb.andWhere('n.read = :read', { read: status === 'read' });

    const dateRange = parseDateRange(range);
    if (dateRange) {
      qb.andWhere('n.created_at BETWEEN :from AND :to', {
        from: dateRange[0],
        to: dateRange[1],
      });
    }

    if (search) {
      qb.andWhere('(n.title LIKE :search OR n.message LIKE :search)', {
        search: `%${search}%`,
      });
    }

    qb.orderBy('n.created_at', order === 'newest' ? 'DESC' : 'ASC')
      .skip(offset)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { meta: { total, offset, limit }, data };
  }

  public async countByStatus(userId: number, isRead: boolean) {
    return this.notificationRepo.count({
      where: { user_id: userId, read: isRead },
    });
  }

  public async getOne(notificationId: number, markRead = true) {
    const notification = await this.notificationRepo.findOne({ where: { id: notificationId } });
    if (!notification) throw new NotFoundError('Notification not found');

    if (markRead && !notification.read) {
      notification.read = true;
      await this.notificationRepo.save(notification);
    }

    return notification;
  }

  public async readAll(userId: number) {
    await this.notificationRepo.update({ user_id: userId, read: false }, { read: true });
    return true;
  }

  public async markSpecificAsRead(userId: number, ids: number[]) {
    if (!ids?.length) return [];

    await this.notificationRepo.update({ user_id: userId, id: In(ids), read: false }, { read: true });

    const updated = await this.notificationRepo.find({
      where: { user_id: userId, id: In(ids), read: true },
      select: ['id'],
    });

    return updated.map((x) => x.id);
  }

  public async deleteMany(userId: number, ids: number[]) {
    if (!ids?.length) return [];

    await this.notificationRepo.delete({
      user_id: userId,
      id: In(ids),
    });

    return ids;
  }

  public async deleteAll(userId: number) {
    const { affected } = await this.notificationRepo.delete({ user_id: userId });
    return affected ?? 0;
  }
}
