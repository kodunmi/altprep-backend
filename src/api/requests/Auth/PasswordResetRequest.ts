import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordRequest {
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class PasswordResetRequest {
    @IsNotEmpty()
    @IsString()
    token: string;

    @IsNotEmpty()
    @IsString()
    password: string;

    @IsNotEmpty()
    @IsString()
    password_confirmation: string;
}