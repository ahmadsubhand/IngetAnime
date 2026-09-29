import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard, OptionalAuthGuard } from '../auth/guard/auth.guard';
import { Request } from 'express';
import { JwtPayload } from '../../types';
import { ApiResponse } from '../../types';
import { AllAnime, User } from './user.model';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import type {
  CheckEmail,
  CheckUsername,
  GetUserAnimeList,
  ImportAnimeListFromMal,
  UpdateUserDetail,
} from './user.validation';
import { UserValidation } from './user.validation';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';

@Controller('user')
export class UserController {
  constructor(private service: UserService) {}

  @SkipThrottle()
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getUserDetail(
    @Req() req: Request & { user: JwtPayload },
  ): Promise<ApiResponse<User>> {
    const user = await this.service.getUserDetail(req.user.sub);
    return {
      message: 'Get user detail successfully',
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  @Put('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updateUserDetail(
    @Req() req: Request & { user: JwtPayload },
    @Body(new ZodValidationPipe(UserValidation.UPDATE_USER_DETAIL))
    data: UpdateUserDetail,
  ): Promise<ApiResponse<User>> {
    const user = await this.service.updateUserDetail(req.user.sub, data);
    return {
      message: 'Update user detail successfully',
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  @SkipThrottle()
  @Get('/me/my-list-status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getUserAnimeList(
    @Req() req: Request & { user: JwtPayload },
    @Query(new ZodValidationPipe(UserValidation.GET_USER_ANIME_LIST))
    data: GetUserAnimeList,
  ): Promise<ApiResponse<AllAnime>> {
    const userAnimeList = await this.service.getUserAnimeList(
      req.user.sub,
      data,
    );
    return {
      message: 'Get user detail successfully',
      data: userAnimeList,
      statusCode: HttpStatus.OK,
    };
  }

  @Post('/me/import-from-mal')
  @Throttle({
    default: {
      ttl: 60000,
      limit: 1,
    },
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async importAnimeListFromMal(
    @Req() req: Request & { user: JwtPayload },
    @Body(new ZodValidationPipe(UserValidation.IMPORT_ANIME_LIST_FROM_MAL))
    data: ImportAnimeListFromMal,
  ): Promise<ApiResponse<{ count: number }>> {
    const count = await this.service.importAnimeListFromMal(req.user.sub, data);
    return {
      message: 'Import user anime list from MyAnimeList successfully',
      data: count,
      statusCode: HttpStatus.OK,
    };
  }

  @SkipThrottle()
  @Get('/check/email')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  async checkEmailAvailability(
    @Req() req: Request & { user?: JwtPayload },
    @Query(new ZodValidationPipe(UserValidation.CHECK_EMAIL))
    data: CheckEmail,
  ): Promise<ApiResponse<{ email: string }>> {
    const email = await this.service.checkEmailAvailability(
      data.email,
      req.user?.sub,
    );
    return {
      message: 'Check email availability successfully',
      data: email,
      statusCode: HttpStatus.OK,
    };
  }

  @SkipThrottle()
  @Get('/check/username')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  async checkUsernameAvailability(
    @Req() req: Request & { user?: JwtPayload },
    @Query(new ZodValidationPipe(UserValidation.CHECK_USERNAME))
    data: CheckUsername,
  ): Promise<ApiResponse<{ username: string }>> {
    const username = await this.service.checkUsernameAvailability(
      data.username,
      req.user?.sub,
    );
    return {
      message: 'Check usernam availability successfully',
      data: username,
      statusCode: HttpStatus.OK,
    };
  }
}
