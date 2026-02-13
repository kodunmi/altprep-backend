import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository, ILike } from 'typeorm';
import { LiveClass } from '@api/models/LiveClass';
import { NotFoundError } from 'routing-controllers';
import { LiveClassRecordingQuery } from '@base/api/requests/LiveClass/LiveClassRequest';

@Service()
export class LiveClassService {
  constructor(@InjectRepository(LiveClass) private liveClassRepo: Repository<LiveClass>) {}

  async listUserClasses(userId: number, courseId?: number) {
    const where: any = { user_id: userId };
    if (courseId) where.course_id = courseId;

    return this.liveClassRepo.find({
      where,
      order: { start_time: 'ASC', date: 'ASC' },
    });
  }

  async findClass(userId: number, classId: number) {
    const record = await this.liveClassRepo.findOne({
      where: { id: classId, user_id: userId },
    });

    if (!record) throw new NotFoundError('Live class not found');
    return record;
  }

  async listRecordings(userId: number, filters: LiveClassRecordingQuery) {
    const limit = filters.limit ?? 10;
    const orderDirection = filters.order ?? 'ASC';

    const qb = this.liveClassRepo
      .createQueryBuilder('lc')
      .leftJoinAndSelect('lc.course', 'course')
      .leftJoinAndSelect('course.track', 'track')
      .where('lc.recording_url IS NOT NULL')
      .andWhere('lc.user_id = :userId', { userId });

    if (filters.search) {
      const search = `%${filters.search.toLowerCase()}%`;

      qb.andWhere(
        `(LOWER(lc.title) LIKE :search
            OR LOWER(lc.description) LIKE :search
            OR LOWER(course.name) LIKE :search)`,
        { search },
      );
    }

    if (filters.track_id) {
      qb.andWhere('course.track_id = :trackId', {
        trackId: filters.track_id,
      });
    }

    qb.orderBy('lc.recording_uploaded_at', orderDirection).limit(limit);

    const results = await qb.getMany();
    return results;
  }
}
