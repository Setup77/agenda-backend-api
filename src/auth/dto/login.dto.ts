import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  login!: string; // username OU email

  @MinLength(5)
  password!: string;

  @IsNotEmpty()
  csrfToken!: string;
}
