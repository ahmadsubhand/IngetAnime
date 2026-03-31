import {
  Body,
  Controller,
  Get,
  HttpCode,
  type HttpRedirectResponse,
  HttpStatus,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
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
import { MalService } from '../common/mal.service';

dayjs.extend(duration);

@Controller('auth')
export class AuthController {
  private JWT_COOKIE_NAME: string;
  private JWT_MAX_AGE = dayjs.duration(28, 'days').asMilliseconds();
  constructor(
    private service: AuthService,
    private jwt: JwtService,
    private cookie: CookieService,
    private mal: MalService,
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
  async register(
    @Body(new ZodValidationPipe(AuthValidation.REGISTER)) data: Register,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<UserResponse>> {
    const user = await this.service.register(data);
    this.setAuthCookie(user.id, res);
    return {
      message: 'Account created successfully. OTP has been sent to your email',
      data: user,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(AuthValidation.LOGIN)) data: Login,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<UserResponse>> {
    const user = await this.service.login(data);
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
  async verifyEmail(
    @Body(new ZodValidationPipe(AuthValidation.EMAIL_VERIFICATION))
    data: EmailVerification,
    @Req() req: Request & { user: JwtPayload },
  ): Promise<ApiResponse<UserResponse>> {
    const user = await this.service.verifyEmail(req.user.sub, data.otpCode);
    return {
      message: 'Account verified successfully',
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  @Post('resend-verification')
  @Throttle({
    default: {
      ttl: 60000,
      limit: 1,
    },
  })
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
      ttl: 60000,
      limit: 1,
    },
  })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body(new ZodValidationPipe(AuthValidation.FORGOT_PASSWORD))
    data: ForgotPassword,
  ): Promise<ApiResponse<{ email: string; username: string }>> {
    const user = await this.service.forgotPassword(data.identifier);
    return {
      message: `Password reset link has been sent to ${user.email}`,
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(new ZodValidationPipe(AuthValidation.RESET_PASSWORD))
    data: ResetPassword,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<UserResponse>> {
    const user = await this.service.resetPassword(data);
    this.setAuthCookie(user.id, res);
    return {
      message: 'Password has been reset successfully',
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('google')
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

  @Get('mal')
  @Redirect()
  redirectMal(): HttpRedirectResponse {
    const url = this.mal.generateAuthUrl();
    return {
      url,
      statusCode: HttpStatus.FOUND,
    };
  }

  @Get('/mal/callback')
  async loginWithMal(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<UserResponse>> {
    const { access_token, refresh_token } = await this.mal.getToken(code);
    const malProfile = await this.mal.getProfile(access_token);

    const { statusCode, ...user } = await this.service.loginWithMal(
      access_token,
      refresh_token,
      malProfile.id.toString(),
      malProfile.name,
      malProfile.picture,
    );
    this.setAuthCookie(user.id, res);

    res.status(statusCode);
    return {
      message:
        statusCode === HttpStatus.OK
          ? 'Login with MyAnimeList successfully'
          : 'Account created successfully. MyAnimeList account linked',
      data: user,
      statusCode,
    };
  }
}
