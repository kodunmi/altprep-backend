import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Course } from '@base/api/models/Course';
import { Lesson } from '@base/api/models/Lesson';

export default class LessonSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    
    const courses = await connection.getRepository(Course).find();

    for (const course of courses) {
      await factory(Lesson)()
        .map(async (lesson) => {
          lesson.course_id = course.id;
          return lesson;
        })
        .createMany(8);
    }
  }
}
