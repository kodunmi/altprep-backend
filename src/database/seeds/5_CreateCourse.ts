import { Factory, Seeder } from 'typeorm-seeding';
import { getRepository } from 'typeorm';
import { Course } from '@api/models/Course';
import { Track } from '@api/models/Track';

export default class CreateCourses implements Seeder {
  public async run(factory: Factory): Promise<void> {
    const trackRepo = getRepository(Track);
    const tracks = await trackRepo.find();

    if (tracks.length === 0) {
      return;
    }

    await factory(Course)()
      .map(async (course: Course) => {
        const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
        course.track_id = randomTrack.id;
        return course;
      })
      .createMany(10);
  }
}
