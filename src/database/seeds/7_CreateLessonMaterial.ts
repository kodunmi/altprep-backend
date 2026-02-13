import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { Lesson } from '@base/api/models/Lesson';
import { LessonMaterial } from '@base/api/models/LessonMaterial';

export default class LessonMaterialSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const lessonRepo = connection.getRepository(Lesson);
    const materialRepo = connection.getRepository(LessonMaterial);

    const lessons = await lessonRepo.find();

    const selectedLessons = lessons
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    for (const lesson of selectedLessons) {
      const materials = [
        {
          lesson_id: lesson.id,
          file_name: `${lesson.title}-slides.pdf`,
          file_url: `https://cdn.example.com/lessons/${lesson.id}/slides.pdf`,
          file_type: 'pdf',
        },
        {
          lesson_id: lesson.id,
          file_name: `${lesson.title}-notes.docx`,
          file_url: `https://cdn.example.com/lessons/${lesson.id}/notes.docx`,
          file_type: 'docx',
        },
        {
          lesson_id: lesson.id,
          file_name: `${lesson.title}-reference.mp4`,
          file_url: `https://cdn.example.com/lessons/${lesson.id}/reference.mp4`,
          file_type: 'pdf',
        }
      ];

      const count = Math.floor(Math.random() * 3) + 1;
      await materialRepo.save(materials.slice(0, count));
    }
  }
}
