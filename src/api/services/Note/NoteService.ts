import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';
import { User } from '@api/models/User';
import { Note } from '@api/models/Note';
import { NotFoundError } from 'routing-controllers';

@Service()
export class NoteService {
  constructor(
    @InjectRepository(Note) private noteRepo: Repository<Note>,
  ) {}

  async createUserNote(userId: number, payload: {lessonId: number, content: string}){
    const note = this.noteRepo.create({
        user_id: userId,
        lesson_id: payload.lessonId,
        content: payload.content
    })

    return this.noteRepo.save(note);
  }

  async findLessonNotes(userId: number, lessonId: number) {
    
    const notes = await this.noteRepo.find({
        where: { user_id: userId, lesson_id: lessonId }
      });
    
      if (!notes) throw new NotFoundError('notes not found');
    
      return notes;
  }

  public async deleteNote(userId: number, noteId: number) {
    const note = await this.noteRepo.findOne({
        where: { id: noteId, user_id: userId },
    });

    if (!note) throw new NotFoundError('Note not found');
    await this.noteRepo.remove(note);

    return true
  }
}
