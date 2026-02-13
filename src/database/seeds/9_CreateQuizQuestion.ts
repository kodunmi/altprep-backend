import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Quiz } from '@api/models/Quiz';
import { QuizQuestion } from '@api/models/QuizQuestion';

export default class QuizQuestionSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const quizzes = await connection
    .getRepository(Quiz)
    .createQueryBuilder("quiz")
    .orderBy("RANDOM()")  
    .limit(5)
    .getMany();    

    for (const quiz of quizzes) {
      await factory(QuizQuestion)()
        .map(async (question) => {
          question.quiz_id = quiz.id;
          question.options_json = JSON.stringify(["Option A", "Option B", "Option C", "Option D"]);
          question.answer = "Option A";
          return question;
        })
        .createMany(3);
    }
  }
}
