import { define } from 'typeorm-seeding';
import { Quiz } from '@api/models/Quiz';
import * as Faker from 'faker';

define(Quiz, (faker: typeof Faker) => {
  const quiz = new Quiz();
  quiz.title = faker.lorem.words(3);
  quiz.time_allowed = 300; // 5 mins
  quiz.total_score = 100;
  quiz.pass_score = 60;
  quiz.instructions = faker.lorem.sentences(2);
  return quiz;
});
