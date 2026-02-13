import { JsonController, Get, Post, Body, CurrentUser, UseBefore, Param, Delete, Put } from 'routing-controllers';
import { Service } from 'typedi';
import { OpenAPI } from 'routing-controllers-openapi';
import { NoteService } from '@api/services/Note/NoteService';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';
import { CreateNoteRequest } from '@base/api/requests/Note/NoteRequest';


@Service()
@JsonController('/notes')
@OpenAPI({
    security: [{ bearerAuth: [] }],
})
@UseBefore(AuthCheck)
export class NoteController {
  constructor( private noteService: NoteService ) {}

  @Post('/:lessonId')
  async createNote(
    @CurrentUser() user: LoggedUserInterface,
    @Param('lessonId') lessonId: number,
    @Body() body: CreateNoteRequest
  ) { 
    const { content } = body
    const note = await this.noteService.createUserNote(user.id, {lessonId, content });
    return {
        status: true,
        message: 'Note created successfully',
        data: note,
    }
  }

  @Get('/:lessonId')
  async listLessonNotes(
    @Param('lessonId') lessonId: number,
    @CurrentUser() user: LoggedUserInterface
  ) {
    const notes = await this.noteService.findLessonNotes(user.id, lessonId);
    return {
        status: true,
        message: 'Lesson notes retrieved successfully',
        data: notes,
    }
  }

  @Delete('/:id')
  async deleteNote(
    @CurrentUser() user: LoggedUserInterface,
    @Param('id') id: number
  ) {
    await this.noteService.deleteNote(user.id, id);
    return {
        status: true,
        message: 'Noted deleted successfully',
    }
  }
}
