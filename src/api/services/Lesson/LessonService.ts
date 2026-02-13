import { Service } from 'typedi';
import { Lesson } from '@base/api/models/Lesson';
import { LessonProgress } from '@base/api/models/LessonProgress';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { NotFoundError } from 'routing-controllers';


@Service()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private progressRepo: Repository<LessonProgress>,
  ) {}

  async findCourseLessons(userId: number, courseId: number, filters: any) {
    const { search, status, limit = 10, page = 1 } = filters;
  
    const qb = this.lessonRepo.createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.progress', 'lp', 'lp.user_id = :userId', { userId })
      .where('lesson.course_id = :courseId', { courseId })
      .orderBy('lesson.order', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);
  
    if (search) {
      qb.andWhere('(lesson.title ILIKE :search OR lesson.content ILIKE :search)', {
        search: `%${search}%`,
      });
    }
  
    // Apply lesson status filters
    if (status === 'completed') {
      qb.andWhere('lp.completed = true');
    } else if (status === 'in_progress') {
      qb.andWhere('lp.completed = false AND lp.progress_seconds > 0');
    } else if (status === 'not_started') {
      qb.andWhere('lp.id IS NULL');
    }
  
    const [data, total] = await qb.getManyAndCount();
  
    return {
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data,
    };
  }

  async findLesson(userId: number, lessonId: number) {
      
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId }, relations: ['progress', 'materials'] });
    if (!lesson) throw new NotFoundError('Lesson not found');

    return lesson;
  }
  async updateProgress(userId: number, lessonId: number, currentTime: number) {
    const lesson = await this.lessonRepo.findOne({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundError('Lesson not found');

    let progress = await this.progressRepo.findOne({ where: { user_id: userId, lesson_id: lessonId } });

    if (!progress) {
      progress = this.progressRepo.create({
        user_id: userId,
        lesson_id: lessonId,
      });
    }

    progress.progress_seconds = currentTime;
    progress.completed = false;

    return await this.progressRepo.save(progress);
  }

  async markCompleted(userId: number, lessonId: number) {
    let progress = await this.progressRepo.findOne({ where: { user_id: userId, lesson_id: lessonId } });

    if (!progress) {
      progress = this.progressRepo.create({
        user_id: userId,
        lesson_id: lessonId,
      });
    }

    progress.completed = true;
    progress.progress_seconds = 0;

    return await this.progressRepo.save(progress);
  }
}
