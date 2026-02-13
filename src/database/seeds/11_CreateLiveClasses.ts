import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User } from '@base/api/models/User';
import { LiveClass } from '@base/api/models/LiveClass';
import { RoleRepository } from '@base/api/repositories/Users/RoleRepository';

export default class LiveClassSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const roleRepo = connection.getCustomRepository(RoleRepository);

    const clientRole = await roleRepo.findOne({ where: { name: 'Client' } });
    const user = await connection.getRepository(User).findOne({
      where: { role_id: clientRole.id },
    });

    if (!user) {
      return;
    }

    const liveClasseRepo = connection.getRepository(LiveClass);

    const classes = [
      {
        user_id: user.id,
        title: 'Introduction to Web Development',
        description: 'A live class covering the basics of HTML, CSS, and JS.',
        date: '2025-02-01',
        start_time: '16:00',
        class_url: 'https://zoom.us/webdev-class-001',
      },
      {
        user_id: user.id,
        title: 'Advanced AI',
        description: 'Deep dive into AI',
        date: '2025-02-05',
        start_time: '14:00',
        class_url: 'https://zoom.us/ai-advanced-002',
      },
    ];

    await liveClasseRepo.save(classes);
  }
}
