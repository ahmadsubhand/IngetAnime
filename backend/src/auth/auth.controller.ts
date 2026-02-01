import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import type {
  EmailVerification,
  ForgotPassword,
  Login,
  Register,
  ResetPassword,
} from './auth.validation';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import type { ApiResponse, JwtPayload, UserResponse } from '../types';
import { Throttle } from '@nestjs/throttler';
import { CookieService } from '../common/cookie.service';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-google-oauth20';

dayjs.extend(duration);

@Controller('auth')
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

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
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
      statusCode: HttpStatus.CREATED,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
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
      statusCode: HttpStatus.OK,
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
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
      statusCode: HttpStatus.OK,
    };
  }

  @Throttle({
    default: {
      ttl: 6000,
      limit: 1,
    },
  })
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  async resendVerification(
    @Req() req: Request & { user: JwtPayload },
  ): Promise<ApiResponse<{ email: string }>> {
    const user = await this.service.resendVerification(req.user.sub);
    return {
      message: `OTP has been sent to ${user.email}`,
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt'))
  logout(@Res({ passthrough: true }) res: Response): ApiResponse<boolean> {
    this.cookie.clearCookie(res, this.JWT_COOKIE_NAME);
    return {
      message: 'Logout successfully',
      data: true,
      statusCode: HttpStatus.OK,
    };
  }

  @Post('forgot-password')
  @Throttle({
    default: {
      ttl: 6000,
      limit: 1,
    },
  })
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(AuthValidation.FORGOT_PASSWORD))
  async forgotPassword(
    @Body() req: ForgotPassword,
  ): Promise<ApiResponse<{ email: string; username: string }>> {
    const user = await this.service.forgotPassword(req.identifier);
    return {
      message: `Password reset link has been sent to ${user.email}`,
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(AuthValidation.RESET_PASSWORD))
  async resetPassword(
    @Body() req: ResetPassword,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<UserResponse>> {
    const user = await this.service.resetPassword(req.token, req.newPassword);
    this.setAuthCookie(user.id, res);
    return {
      message: 'Password has been reset successfully',
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  redirectGoogle() {}

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  async loginWithGoogle(
    @Req() req: Request & { user: Profile['_json'] },
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<UserResponse>> {
    const { statusCode, ...user } = await this.service.loginWithGoogle(
      req.user.sub,
      req.user.email as string,
      req.user.picture,
    );
    this.setAuthCookie(user.id, res);

    res.status(statusCode);
    return {
      message:
        statusCode === HttpStatus.OK
          ? 'Login with Google successfully'
          : 'Account created successfully. Google account linked',
      data: user,
      statusCode,
    };
  }
}
