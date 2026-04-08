import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { AuthValidation } from './auth.validation';
import type {
  EmailVerification,
  ForgotPassword,
  GetAuthUrl,
  Login,
  Register,
  ResetPassword,
  ThirdPartyLogin,
} from './auth.validation';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import type { JwtPayload, StateObject } from '../../types';
import type { ApiResponse, UserResponse } from '../../types/entity';
import { Throttle } from '@nestjs/throttler';
import { CookieService } from '../../common/cookie.service';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { ConfigService } from '@nestjs/config';
import { MalService } from '../../common/mal.service';
import { AuthGuard } from './guard/auth.guard';
import { JwtService } from '../../common/jwt.service';
import { GoogleService } from '../../common/google.service';
import cryptoRandomString from 'crypto-random-string';

dayjs.extend(duration);

@Controller('auth')
export class AuthController {
  private JWT_COOKIE_NAME: string;
  private JWT_MAX_AGE = dayjs.duration(28, 'days').asMilliseconds();
  private STATE_COOKIE_NAME: string;
  private STATE_MAX_AGE = dayjs.duration(5, 'minutes').asMilliseconds();
  constructor(
    private service: AuthService,
    private jwt: JwtService,
    private cookie: CookieService,
    private google: GoogleService,
    private mal: MalService,
    config: ConfigService,
  ) {
    const environment = config.get<'production' | 'development'>(
      'NODE_ENV',
      'development',
    );
    this.JWT_COOKIE_NAME =
      environment === 'production' ? '__Host-x-access-token' : 'x-access-token';
    this.STATE_COOKIE_NAME =
      environment === 'production' ? '__Host-x-oauth-state' : 'x-oauth-state';
  }

  setAuthCookie(payload: JwtPayload, res: Response) {
    const token = this.jwt.createToken(payload);
    this.cookie.setCookie(res, this.JWT_COOKIE_NAME, token, this.JWT_MAX_AGE);
  }

  getAndSetAuthState(mode: StateObject['mode'], res: Response) {
    const randomString = cryptoRandomString({
      length: 24,
      type: 'alphanumeric',
    });

    this.cookie.setCookie(
      res,
      this.STATE_COOKIE_NAME,
      randomString,
      this.STATE_MAX_AGE,
    );

    const stateObject: StateObject = { mode, state: randomString };
    const stateParsed = JSON.stringify(stateObject);
    const stateEncoded = Buffer.from(stateParsed).toString('base64');

    return stateEncoded;
  }

  getAndCheckAuthState(state: string, req: Request) {
    let stateObject: StateObject;

    try {
      const stateDecoded = state;
      const stateParsed = Buffer.from(stateDecoded, 'base64').toString('utf-8');
      stateObject = JSON.parse(stateParsed) as StateObject;
    } catch {
      throw new BadRequestException('Invalid state');
    }

    const cookieState = req.cookies?.[this.STATE_COOKIE_NAME] as
      | string
      | undefined;
    if (stateObject.state !== cookieState) {
      throw new BadRequestException('Invalid state');
    }

    return stateObject;
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(AuthValidation.REGISTER)) data: Register,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<UserResponse>> {
    const user = await this.service.register(data);
    this.setAuthCookie({ sub: user.id, type: 'access_token' }, res);
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
    this.setAuthCookie({ sub: user.id, type: 'access_token' }, res);
    return {
      message: `Login successfully${user.isVerified ? '' : '. Please verify your email'}`,
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
    this.setAuthCookie({ sub: user.id, type: 'reset_password' }, res);
    return {
      message: 'Password has been reset successfully',
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('google')
  @HttpCode(HttpStatus.OK)
  getGoogleAuthUrl(
    @Query(new ZodValidationPipe(AuthValidation.GET_AUTH_URL))
    data: GetAuthUrl,
    @Res({ passthrough: true }) res: Response,
  ): ApiResponse<{ url: string }> {
    const { mode } = data;
    const state = this.getAndSetAuthState(mode, res);
    const url = this.google.generateAuthUrl(state);
    return {
      message: 'Generate Google auth url successfully',
      data: { url },
      statusCode: HttpStatus.OK,
    };
  }

  @Post('google')
  async loginWithGoogle(
    @Body(new ZodValidationPipe(AuthValidation.THIRD_PARTY_LOGIN))
    data: ThirdPartyLogin,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<ApiResponse<UserResponse>> {
    const stateObject = this.getAndCheckAuthState(data.state, req);
    if (stateObject.mode !== 'login') {
      throw new BadRequestException('Invalid state type');
    }

    const credentials = await this.google.getToken(data.code);
    this.google.setCredential(credentials);
    const { id, email, picture } = await this.google.getProfile();
    if (id && email) {
      const { statusCode, ...user } = await this.service.loginWithGoogle(
        id.toString(),
        email,
        picture,
      );
      this.setAuthCookie({ sub: user.id, type: 'access_token' }, res);

      res.status(statusCode);
      return {
        message:
          statusCode === HttpStatus.OK
            ? 'Login with Google successfully'
            : 'Account created successfully. Google account linked',
        data: user,
        statusCode,
      };
    } else {
      throw new BadRequestException('Invalid google account');
    }
  }

  @Get('mal')
  @HttpCode(HttpStatus.OK)
  getMalAuthUrl(
    @Query(new ZodValidationPipe(AuthValidation.GET_AUTH_URL))
    data: GetAuthUrl,
    @Res({ passthrough: true }) res: Response,
  ): ApiResponse<{ url: string }> {
    const { mode } = data;
    const state = this.getAndSetAuthState(mode, res);
    const url = this.mal.generateAuthUrl(state);
    return {
      message: 'Generate MyAnimeList auth url successfully',
      data: { url },
      statusCode: HttpStatus.OK,
    };
  }

  @Post('mal')
  async loginWithMal(
    @Body(new ZodValidationPipe(AuthValidation.THIRD_PARTY_LOGIN))
    data: ThirdPartyLogin,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ): Promise<ApiResponse<UserResponse>> {
    const stateObject = this.getAndCheckAuthState(data.state, req);
    if (stateObject.mode !== 'login') {
      throw new BadRequestException('Invalid state type');
    }

    const { access_token, refresh_token } = await this.mal.getToken(data.code);
    const malProfile = await this.mal.getProfile(access_token);

    const { statusCode, ...user } = await this.service.loginWithMal(
      access_token,
      refresh_token,
      malProfile,
    );
    this.setAuthCookie({ sub: user.id, type: 'access_token' }, res);

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
