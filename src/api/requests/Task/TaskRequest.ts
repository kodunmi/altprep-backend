import { IsOptional, IsString } from 'class-validator';

export class TaskRequestQuery {
    @IsOptional()
    @IsString()
    course_id?: number;
}