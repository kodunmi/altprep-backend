import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';
import { User } from '@api/models/User';
import { Course } from '@api/models/Course';
import { UserNotFound } from '@base/api/exceptions/Auth/InvalidCredentials';
import { NotFoundError } from 'routing-controllers';
import { CourseRequest } from '@base/api/requests/Course/CourseRequest';
import { ILike } from 'typeorm';

@Service()
export class CourseService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
  ) {}

  async getUserCourses(userId: number, query: CourseRequest) {
    
    const user = await this.userRepo.findOne({
        where: { id: userId },
        relations: ['track']
      });
    
      if (!user) throw new UserNotFound();
      if (!user.track_id) throw new Error('User has not selected a track yet');
    
      const limit = query.limit ?? 10;
      const page = query.page ?? 1;
      const skip = (page - 1) * limit;
    
      const where = [
        {
          track_id: user.track_id,
          ...(query.status ? { status: query.status } : {}),
          ...(query.search ? { name: ILike(`%${query.search}%`) } : {}),
        }
      ];      
      const [courses, total] = await this.courseRepo.findAndCount({
        where,
        relations: ['track'],
        take: limit,
        skip,
        order: { created_at: 'DESC' }
      });
    
      return {
        meta: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        },
        data: courses
      };
  }

  public async findCourse(userId: number, courseId: number) {
    const user = await this.userRepo.findOne({
        where: { id: userId },
    });
    const course = await this.courseRepo.findOne({
      where: { id: courseId, track_id: user.track_id },
      relations: ['track'],
    });

    if (!course) throw new NotFoundError('Course not found');

    return course;
  }
}
