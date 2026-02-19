import { IsInt, IsString, IsOptional, IsEnum } from 'class-validator';

export enum TransactionStatusEnum {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export class TransactionRequest {
  @IsOptional()
  @IsEnum(TransactionStatusEnum, { message: 'status must be pending, completed, or failed' })
  status?: TransactionStatusEnum;

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  page?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  filter?: string;

  @IsOptional()
  @IsString()
  relations?: string;
}