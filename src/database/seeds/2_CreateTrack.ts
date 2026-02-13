import { TrackRepository } from '@base/api/repositories/TrackRepository';
import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';

export default class CreateTracks implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const tracks = [
      { name: 'Frontend', description: 'Learn HTML, CSS, JavaScript, frameworks and UI development.' },
      { name: 'Backend', description: 'Learn server-side programming, databases, and API development.' },
    ];

    for (const trackData of tracks) {
      const existingTrack = await connection
        .getCustomRepository(TrackRepository)
        .findOne({ where: { name: trackData.name } });

      if (existingTrack) {
        continue;
      }

      await connection.getCustomRepository(TrackRepository).createTrack(trackData);
    }
  }
}
