import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';
import { QuizService } from '@base/api/services/Quiz/QuizService';
import { Service } from 'typedi';
import { OpenAPI } from 'routing-controllers-openapi';
import { JsonController, Get, Param, Post, Body, UseBefore, CurrentUser } from 'routing-controllers';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { SubmitQuizRequest } from '@base/api/requests/Quiz/QuizRequest';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@UseBefore(AuthCheck)
@JsonController('/quizzes')
export class QuizController {
  constructor(private quizService: QuizService) {}

  @Get('/lesson/:lessonId')
  async listLessonQuizzes(@CurrentUser() user: LoggedUserInterface, @Param('lessonId') lessonId: number) {
    const quizzes = await this.quizService.getLessonQuizzes(user.id, lessonId);
    return {
      status: true,
      message: 'Quizzes retrieved successfully',
      data: quizzes,
    };
  }

  @Get('/:quizId/attempts')
  async listAttempts(@CurrentUser() user: LoggedUserInterface, @Param('quizId') quizId: number) {
    const attempts = await this.quizService.listQuizAttempts(user.id, quizId);
    return {
        status: true,
        message: 'Quiz attempts retrieved successfully',
        data: attempts,
    };
  }

  @Get('/:quizId')
  async getQuiz(@CurrentUser() user: LoggedUserInterface, @Param('quizId') quizId: number) {
    const quiz = await this.quizService.getQuizDetails(user.id, quizId);
    return {
      status: true,
      message: 'Quiz retrieved successfully',
      data: quiz,
    };
  }

  @Post('/:quizId/submit')
  async submitQuiz(@CurrentUser() user: LoggedUserInterface, @Param('quizId') quizId: number, @Body() body: SubmitQuizRequest) {
    const response = await this.quizService.submitQuiz(user.id, quizId, body);
    return {
        status: true,
        message: 'Quiz submitted successfully',
        data: response,
    };
  }
}
