import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsNotEmpty } from 'class-validator';

export class UserUpdateRequest {
  @MaxLength(20)
  @MinLength(2)
  @IsString()
  @IsOptional()
  first_name: string;

  @MaxLength(20)
  @MinLength(2)
  @IsString()
  @IsOptional()
  last_name: string;

  @IsEmail()
  @IsString()
  @IsOptional()
  email: string;

  @MaxLength(20)
  @MinLength(6)
  @IsString()
  @IsOptional()
  password: string;
}

export class UserUpdatePassword {

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  password_confirmation: string;
}
