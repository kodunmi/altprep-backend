import { define } from 'typeorm-seeding';
import { QuizQuestion } from '@api/models/QuizQuestion';
import * as Faker from 'faker';

define(QuizQuestion, (faker: typeof Faker) => {
  const q = new QuizQuestion();
  q.question_text = faker.lorem.sentence();
  q.type = "multiple_choice";
  q.options_json = null;
  q.answer = "";
  return q;
});