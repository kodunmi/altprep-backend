import { IsOptional, IsInt, IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class LessonRequest {

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(['not_started', 'in_progress', 'completed'], { message: 'Invalid status filter' })
  status?: 'not_started' | 'in_progress' | 'completed';

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  page?: number;
}

export class LessonUpdateRequest {
  @IsNotEmpty()
  @IsInt()
  current_time: number;
}