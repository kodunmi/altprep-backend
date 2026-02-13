import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';

import { Quiz } from '@api/models/Quiz';
import { QuizQuestion } from '@api/models/QuizQuestion';
import { Lesson } from '@api/models/Lesson';
import { User } from '@api/models/User';
import { QuizAttempt } from '@api/models/QuizAttempt';

import { NotFoundError, BadRequestError, ForbiddenError } from 'routing-controllers';

@Service()
export class QuizService {
  constructor(
    @InjectRepository(Quiz) private quizRepo: Repository<Quiz>,
    @InjectRepository(QuizQuestion) private questionRepo: Repository<QuizQuestion>,
    @InjectRepository(QuizAttempt) private attemptRepo: Repository<QuizAttempt>,
    @InjectRepository(Lesson) private lessonRepo: Repository<Lesson>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async validateQuizAccess(userId: number, quizId: number) {
    const quiz = await this.quizRepo.findOne({
      where: { id: quizId },
      relations: ['lesson', 'lesson.course', 'lesson.course.track'],
    });

    if (!quiz) throw new NotFoundError('Quiz not found');
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['track'],
    });

    if (!user?.track_id || user.track_id !== quiz.lesson.course.track_id) {
      throw new ForbiddenError('You cannot access quizzes outside your track');
    }

    return quiz;
  }

  async getLessonQuizzes(userId: number, lessonId: number) {
    const lesson = await this.lessonRepo.findOne({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundError('Lesson not found');

    const qb = this.quizRepo
      .createQueryBuilder('quiz')
      .leftJoin('quiz.questions', 'question')
      .where('quiz.lesson_id = :lessonId', { lessonId })
      .loadRelationCountAndMap('quiz.questions_count', 'quiz.questions')
      .orderBy('quiz.id', 'ASC');

    return qb.getMany();
  }

  async getQuizDetails(userId: number, quizId: number) {
    await this.validateQuizAccess(userId, quizId);

    const quiz = await this.quizRepo.findOne({
      where: { id: quizId },
      relations: ['questions'],
    });

    quiz.questions = quiz.questions.map((q) => {
      delete q.answer;
      return q;
    });

    return quiz;
  }

  async submitQuiz(userId: number, quizId: number, payload: { answers: { question_id: number; selected: string }[] }) {
    const quiz = await this.validateQuizAccess(userId, quizId);

    if (!payload?.answers || !Array.isArray(payload.answers)) {
      throw new BadRequestError('Answers must be an array');
    }

    const questions = await this.questionRepo.find({
      where: { quiz_id: quizId },
    });

    if (questions.length === 0) {
      throw new BadRequestError('Quiz has no questions');
    }

    const perQuestionScore = quiz.total_score / questions.length;
    let totalScore = 0;
    const attempts: QuizAttempt[] = [];

    for (const q of questions) {
      const input = payload.answers.find((a) => a.question_id === q.id);

      if (!input) {
        throw new BadRequestError(`Missing answer for question ${q.id}`);
      }

      const isCorrect = q.answer === input.selected;
      if (isCorrect) totalScore += perQuestionScore;

      const attempt = this.attemptRepo.create({
        user_id: userId,
        quiz_id: quizId,
        question_id: q.id,
        selected_answer: input.selected,
        is_correct: isCorrect,
        attempted_at: new Date(),
      });

      attempts.push(attempt);
    }

    await this.attemptRepo.save(attempts);

    return {
      quiz_id: quizId,
      total_questions: questions.length,
      correct: payload.answers.filter((a) => questions.some((q) => q.id === a.question_id && q.answer === a.selected)).length,
      score: totalScore,
      passed: totalScore >= quiz.pass_score,
    };
  }

  async listQuizAttempts(userId: number, quizId: number) {
    const userAttempts = await this.attemptRepo.find({
      where: { quiz_id: quizId, user_id: userId },
      relations: ['question'],
    });

    const quiz = await this.quizRepo.findOne({
      where: { id: quizId },
      relations: ['questions'],
    });

    const attemptsData = userAttempts.map((a) => ({
      question_id: a.question_id,
      question_text: a.question?.question_text,
      selected_answer: a.selected_answer,
      is_correct: a.is_correct,
      attempted_at: a.attempted_at,
    }));

    const totalScore = userAttempts.reduce((sum, a) => (a.is_correct ? sum + 1 : sum), 0);

    return {
      quiz_id: quizId,
      quiz_title: quiz.title,
      total_questions: quiz.questions.length,
      total_attempted: userAttempts.length,
      score: totalScore,
      passed: totalScore >= quiz.pass_score,
      attempts: attemptsData,
    };
  }
}
