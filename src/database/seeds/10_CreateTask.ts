import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User } from '@base/api/models/User';
import { Task } from '@base/api/models/Task';
import { TaskStatus } from '@base/api/interfaces/users/TaskInterface';
import { RoleRepository } from '@base/api/repositories/Users/RoleRepository';

export default class TaskSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const roleRepo = connection.getCustomRepository(RoleRepository);

    const clientRole = await roleRepo.findOne({ where: { name: 'Client' } });
    const user = await connection.getRepository(User).findOne({
      where: { role_id: clientRole.id },
    });

    if (!user) {
      return;
    }

    const taskRepo = connection.getRepository(Task);

    const tasks = [
      {
        user_id: user.id,
        title: "Watch introduction video",
        description: "Complete the basic introduction lesson",
        status: TaskStatus.PENDING,
      },
      {
        user_id: user.id,
        title: "Take Introductory Quiz",
        description: "Submit answers for the first quiz",
        status: TaskStatus.PENDING,
      },
    ];

    await taskRepo.save(tasks);

  }
}
