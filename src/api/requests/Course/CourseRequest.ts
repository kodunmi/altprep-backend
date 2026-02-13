import { CourseStatusEnum } from '@base/api/interfaces/course/CourseInterface';
import { IsInt, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';


export class CourseRequest {
  @IsOptional()
  @IsEnum(CourseStatusEnum, { message: 'status must be pending, completed, or in_progress' })
  status?: CourseStatusEnum;

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  search?: string;
}
