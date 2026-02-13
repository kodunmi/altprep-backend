import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Lesson } from '@api/models/Lesson';
import { Quiz } from '@api/models/Quiz';

export default class QuizSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const lessons = await connection
    .getRepository(Lesson)
    .createQueryBuilder("lesson")
    .orderBy("RANDOM()")  
    .limit(5)
    .getMany();
    
    for (const lesson of lessons) {
      await factory(Quiz)()
        .map(async (quiz) => {
          quiz.lesson_id = lesson.id;
          quiz.title = `Quiz for ${lesson.title}`;
          return quiz;
        })
        .create();
    }
  }
}
