import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// ✅ Extend Express Request type locally to avoid missing type errors during production builds
// ✅ Corrected local interface extension without type-override warnings
interface RequestWithSession extends Request {
  session: {
    captcha?: {
      value: number;
      expiresAt: number;
    };
    csrfToken?: string;
    [key: string]: any; // Allows custom express-session data keys cleanly
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* ===================== CAPTCHA ===================== */

  @Get('captcha')
  getCaptcha(@Req() req: RequestWithSession) {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;

    req.session.captcha = {
      value: a + b,
      expiresAt: Date.now() + 2 * 60 * 1000, // ⏱ 2 minutes
    };

    return { question: `${a} + ${b} = ?` };
  }

  private verifyCaptcha(input: string, req: RequestWithSession) {
    const captcha = req.session.captcha;

    if (!captcha) {
      throw new BadRequestException('Captcha expiré');
    }

    if (Date.now() > captcha.expiresAt) {
      req.session.captcha = undefined;
      throw new BadRequestException('Captcha expiré');
    }

    if (Number(input) !== captcha.value) {
      req.session.captcha = undefined; // 🔥 usage unique
      throw new BadRequestException('Captcha incorrect');
    }

    // ✅ Succès → on détruit
    req.session.captcha = undefined;
  }

  /* ===================== CSRF ===================== */

  @Get('csrf-token')
  getCsrf(@Req() req: RequestWithSession) {
    const token = randomUUID();
    req.session.csrfToken = token;
    return { csrfToken: token };
  }

  private verifyCsrf(token: string, req: RequestWithSession) {
    if (!req.session.csrfToken || token !== req.session.csrfToken) {
      throw new BadRequestException('CSRF invalide');
    }
  }

  /* ===================== REGISTER ===================== */

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: RequestWithSession) {
    this.verifyCaptcha(dto.captcha, req);
    this.verifyCsrf(dto.csrfToken, req);

    return this.authService.register(dto);
  }

  /* ===================== LOGIN ===================== */

  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: RequestWithSession) {
    this.verifyCsrf(dto.csrfToken, req);
    return this.authService.login(dto.login, dto.password);
  }
}
