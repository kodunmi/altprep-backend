import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';
import { NotFoundError } from 'routing-controllers';
import { Task } from '@base/api/models/Task';

@Service()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
  ) {}

  async listTasks(userId: number, courseId?: number) {
    const where: any = { user_id: userId };
    if (courseId) where.course_id = courseId;

    return this.taskRepo.find({
      where,
      order: { created_at: 'ASC' },
    });
  }

  async getTask(userId: number, taskId: number) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId, user_id: userId },
    });

    if (!task) throw new NotFoundError('Task not found');

    return task;
  }
}
