import { IsOptional, IsString, IsInt, MinLength, MaxLength } from 'class-validator';

export class LiveClassRequestQuery {
  @IsOptional()
  @IsString()
  course_id?: number;
}

export class LiveClassRecordingQuery {
  @IsOptional()
  @IsInt()
  track_id?: number;

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  search?: string;
}
