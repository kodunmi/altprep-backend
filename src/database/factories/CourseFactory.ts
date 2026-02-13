import Faker from 'faker';
import { define } from 'typeorm-seeding';
import { Course } from '@api/models/Course';

define(Course, (faker: typeof Faker) => {
  const course = new Course();

  course.name = faker.company.catchPhrase();
  course.short_description = faker.lorem.sentence();
  course.long_description = faker.lorem.paragraphs(3);
  course.video_preview_url = faker.internet.url();
  course.thumbnail_url = faker.image.imageUrl();
  course.status = faker.random.arrayElement(['pending', 'completed', 'in_progress']);
  course.has_certificate = true;
  course.track_id = null;

  return course;
});
