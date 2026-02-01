import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthValidation } from './auth.validation';
import type { EmailVerification, Login, Register } from './auth.validation';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import type { ApiResponse, JwtPayload, UserResponse } from '../types';
import { Throttle } from '@nestjs/throttler';
import { CookieService } from '../common/cookie.service';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { ConfigService } from '@nestjs/config';

dayjs.extend(duration);

@Controller('/auth')
export class AuthController {
  private JWT_COOKIE_NAME: string;
  private JWT_MAX_AGE = dayjs.duration(28, 'days').asMilliseconds();
  constructor(
    private service: AuthService,
    private jwt: JwtService,
    private cookie: CookieService,
    config: ConfigService,
  ) {
    const environment = config.get<'production' | 'development'>(
      'NODE_ENV',
      'development',
    );
    this.JWT_COOKIE_NAME =
      environment === 'production' ? '__Host-x-access-token' : 'x-access-token';
  }

  setAuthCookie(userId: number, res: Response) {
    const payload: JwtPayload = { sub: userId };
    const token = this.jwt.sign(payload);
    this.cookie.setCookie(res, this.JWT_COOKIE_NAME, token, this.JWT_MAX_AGE);
  }

  @Post('/register')
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(AuthValidation.REGISTER))
  async register(
    @Body() data: Register,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<UserResponse>> {
    const user = await this.service.register(
      data.email,
      data.password,
      data.username,
    );
    this.setAuthCookie(user.id, res);
    return {
      message: 'Account created successfully. OTP has been sent to your email',
      data: user,
      statusCode: 201,
    };
  }

  @Post('/login')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(AuthValidation.LOGIN))
  async login(
    @Body() data: Login,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<UserResponse>> {
    const user = await this.service.login(data.identifier, data.password);
    this.setAuthCookie(user.id, res);
    return {
      message: `Login successfully${user.isVerified ? '' : '. Please verify your email'}`,
      data: user,
      statusCode: 200,
    };
  }

  @Post('/verify-email')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  @UsePipes(new ZodValidationPipe(AuthValidation.EMAIL_VERIFICATION))
  async verifyEmail(
    @Body() data: EmailVerification,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<ApiResponse<UserResponse>> {
    const user = await this.service.verifyEmail(req.user.sub, data.otpCode);
    return {
      message: 'Account verified successfully',
      data: user,
      statusCode: 200,
    };
  }

  @Throttle({
    default: {
      ttl: 6000,
      limit: 1,
    },
  })
  @Post('/resend-verification')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  async resendVerification(
    @Req() req: Request & { user: JwtPayload },
  ): Promise<ApiResponse<{ email: string }>> {
    const user = await this.service.resendVerification(req.user.sub);
    return {
      message: `OTP has been sent to ${user.email}`,
      data: user,
      statusCode: 200,
    };
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(AuthGuard('jwt'))
  logout(@Res({ passthrough: true }) res: Response): ApiResponse<boolean> {
    this.cookie.clearCookie(res, this.JWT_COOKIE_NAME);
    return {
      message: 'Logout successfully',
      data: true,
      statusCode: 200,
    };
  }

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  redirectGoogle() {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  loginGoogle(@Req() req: Request) {
    return {
      data: req.user,
    };
  }
}
