import { define } from 'typeorm-seeding';
import Faker from 'faker';
import { Lesson } from '@base/api/models/Lesson';

define(Lesson, (faker: typeof Faker) => {
  const lesson = new Lesson();
  lesson.title = faker.lorem.words(4);
  lesson.content = faker.lorem.paragraphs(2);
  lesson.video_url = faker.internet.url();
  lesson.duration = `${faker.random.number(100)} mins`;
  lesson.order = faker.random.number(100);
  lesson.is_preview = true;  
  return lesson;
});
