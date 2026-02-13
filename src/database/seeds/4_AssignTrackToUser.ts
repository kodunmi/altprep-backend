import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User } from '@api/models/User';
import { Track } from '@api/models/Track';
import { RoleRepository } from '@base/api/repositories/Users/RoleRepository';

export default class AssignTrackToUsersSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const tracks = await connection.getRepository(Track).find();
    const roleRepo = connection.getCustomRepository(RoleRepository);

    const clientRole = await roleRepo.findOne({ where: { name: 'Client' } });

    if (!tracks.length) {
      console.log('No tracks found. Create tracks first.');
      return;
    }

    const users = await connection.getRepository(User).find({ where: { role_id: clientRole.id } });

    for (const user of users) {
      // Assign any track if none
      if (!user.track_id) {
        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];        
        user.track_id = randomTrack.id;
        await connection.getRepository(User).save(user);
      }
    }

    console.log('Track assignment completed.');
  }
}
