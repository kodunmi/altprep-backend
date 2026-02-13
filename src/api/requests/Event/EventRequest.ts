import { EventCategoryEnum } from '@base/api/interfaces/event/EventInterface';
import { IsInt, IsString, MinLength, MaxLength, IsOptional, IsEnum, IsUrl, IsEmail } from 'class-validator';


export class EventRequestQuery {
  @IsOptional()
  @IsEnum(EventCategoryEnum)
  category?: EventCategoryEnum;

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

  @IsOptional()
  @IsString()
  organization?: string;
}

export class EventRegistrationRequest{

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  first_name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  last_name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(7)
  @MaxLength(20)
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  institution?: string;

  @IsOptional()
  @IsUrl(undefined, { message: 'submission_link must be a valid URL' })
  submission_link?: string;

  @IsOptional()
  meta?: Record<string, any>;
}