import { NotificationTypeEnum } from '@base/api/interfaces/notification/NotificationInterface';
import { IsOptional, IsString, IsIn, IsEnum, IsInt, Min, MaxLength, IsArray, IsBoolean } from 'class-validator';

export class NotificationFiltersQuery {
  @IsOptional()
  @IsEnum(NotificationTypeEnum)
  category?: NotificationTypeEnum;

  // format: "YYYY-MM-DD,YYYY-MM-DD"
  @IsOptional()
  @IsString()
  range?: string;

  @IsOptional()
  @IsIn(['read', 'unread'])
  status?: 'read' | 'unread';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsIn(['newest', 'oldest'])
  order?: 'newest' | 'oldest';
}

export class NotificationRequestBody {
  @IsOptional()
  @IsArray()
  ids?: number[]; 
}

export class UpdatePreferenceRequest {
  @IsEnum(NotificationTypeEnum)
  type: NotificationTypeEnum;

  @IsBoolean()
  enabled: boolean;
}