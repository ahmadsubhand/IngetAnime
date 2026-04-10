import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Request } from 'express';
import { JwtPayload } from '../../types';
import {
  ApiResponse,
  UserAnimeListComputedResponse,
  UserResponse,
} from '../../types/entity';
import { SkipThrottle } from '@nestjs/throttler';
import type { GetUserAnimeList } from './user.validation';
import { UserValidation } from './user.validation';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';

@Controller('user')
@SkipThrottle()
export class UserController {
  constructor(private service: UserService) {}

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getUserDetail(
    @Req() req: Request & { user: JwtPayload },
  ): Promise<ApiResponse<UserResponse>> {
    const user = await this.service.getUserDetail(req.user.sub);
    return {
      message: 'Get user detail successfully',
      data: user,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('/me/my-list-status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getUserAnimeList(
    @Req() req: Request & { user: JwtPayload },
    @Query(new ZodValidationPipe(UserValidation.GET_USER_ANIME_LIST))
    data: GetUserAnimeList,
  ): Promise<ApiResponse<UserAnimeListComputedResponse>> {
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
}
