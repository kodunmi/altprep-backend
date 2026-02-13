import { Type } from 'class-transformer';
import { IsArray, ArrayNotEmpty, IsInt, IsString } from 'class-validator';

export class QuizAnswerItem {
  @IsInt()
  question_id: number;

  @IsString()
  selected: string;
}

export class SubmitQuizRequest {
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => QuizAnswerItem)
  answers: QuizAnswerItem[];
}