import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteRequest {
    @IsNotEmpty()
    @IsString()
    content: string;
}