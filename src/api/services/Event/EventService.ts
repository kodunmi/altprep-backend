import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository, ILike } from 'typeorm';
import { Event } from '@api/models/Event';
import { NotFoundError } from 'routing-controllers';
import { EventRegistrationRequest, EventRequestQuery } from '@base/api/requests/Event/EventRequest';
import { EventRegistration } from '@base/api/models/EventRegistration';

@Service()
export class EventService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(EventRegistration) private registrationRepo: Repository<EventRegistration>,

  ) {}

  async listEvents(filters: EventRequestQuery) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.category) where.category = filters.category;
    if (filters.organization) where.organization = filters.organization;

    let qb = this.eventRepo.createQueryBuilder('event').where(where);

    if (filters.search) {
      qb.andWhere(
        `(event.title LIKE :s OR event.description LIKE :s OR event.organization LIKE :s)`,
        { s: `%${filters.search}%` },
      );
    }

    qb.orderBy('event.event_date', 'ASC');
    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data: items,
    };
  }

  async getEvent(id: number) {
    const event = await this.eventRepo.findOne({ where: { id } });
    if (!event) throw new NotFoundError('Event not found');

    return event;
  }

  async register(userId: number, payload: EventRegistrationRequest & { event_id: number }) {
    const event = await this.eventRepo.findOne({ where: { id: payload.event_id } });

    if (!event) throw new NotFoundError('Event not found');

    const registration = this.registrationRepo.create({
      event_id: payload.event_id,
      user_id: userId,
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
      phone: payload.phone,
      institution: payload.institution,
      meta: JSON.stringify(payload.meta),
    });

    await this.registrationRepo.save(registration);

    return registration;
  }

  async listUserRegistrations(userId: number) {
    return this.registrationRepo.find({
      where: { user_id: userId },
      relations: ['event'],
      order: { created_at: 'DESC' },
    });
  }

  async getRegistration(userId: number, registrationId: number) {
    const reg = await this.registrationRepo.findOne({
      where: { id: registrationId, user_id: userId },
      relations: ['event'],
    });

    if (!reg) throw new NotFoundError('Registration not found');

    return reg;
  }
}
