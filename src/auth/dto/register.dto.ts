import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  fullname!: string;

  @IsNotEmpty()
  username!: string;

  @IsEmail()
  email!: string;

  @MinLength(5)
  password!: string;

  @IsNotEmpty()
  confirmPassword!: string;

  @IsNotEmpty()
  captcha!: string;

  @IsNotEmpty()
  csrfToken!: string;
}
