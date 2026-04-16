import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserAnimeListService } from './user-anime-list.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import type {
  AnimeId,
  CreateOrUpdateUserAnimeList,
  CreateUserAnimeList,
  UpdateUserAnimeList,
} from './user-anime-list.validation';
import { UserAnimeListValidation } from './user-anime-list.validation';
import { ApiResponse } from '../../types';
import {
  UserAnimeListWithRelation,
  UserAnimeList,
} from './user-anime-list.model';
import { JwtPayload } from '../../types';
import { SkipThrottle } from '@nestjs/throttler';
import { Anime } from '../anime/anime.model';
import { Platform } from '../platform/platform.model';
import { Link } from '../anime-platform/anime-platform.model';

@Controller('/anime')
export class UserAnimeListController {
  constructor(private service: UserAnimeListService) {}

  @Post('/:animeId/my-list-status')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  async createUserAnimeList(
    @Req() req: Request & { user: JwtPayload },
    @Param(new ZodValidationPipe(UserAnimeListValidation.ANIME_ID))
    param: AnimeId,
    @Body(new ZodValidationPipe(UserAnimeListValidation.CREATE_USER_ANIME_LIST))
    data: CreateUserAnimeList,
  ): Promise<ApiResponse<UserAnimeListWithRelation>> {
    const userAnimeList = await this.service.createUserAnimeList(
      param.animeId,
      req.user.sub,
      data,
    );
    return {
      message: 'Create user anime list successfully',
      data: userAnimeList,
      statusCode: HttpStatus.CREATED,
    };
  }

  @SkipThrottle()
  @Get('/:animeId/my-list-status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getUserAnimeListDetail(
    @Req() req: Request & { user: JwtPayload },
    @Param(new ZodValidationPipe(UserAnimeListValidation.ANIME_ID))
    param: AnimeId,
  ): Promise<ApiResponse<UserAnimeListWithRelation>> {
    const userAnimeList = await this.service.getUserAnimeListDetail(
      param.animeId,
      req.user.sub,
    );
    return {
      message: 'Get user anime list detail successfully',
      data: userAnimeList,
      statusCode: HttpStatus.OK,
    };
  }

  @Put('/:animeId/my-list-status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updateUserAnimeList(
    @Req() req: Request & { user: JwtPayload },
    @Param(new ZodValidationPipe(UserAnimeListValidation.ANIME_ID))
    param: AnimeId,
    @Body(new ZodValidationPipe(UserAnimeListValidation.UPDATE_USER_ANIME_LIST))
    data: UpdateUserAnimeList,
  ): Promise<ApiResponse<UserAnimeListWithRelation>> {
    const userAnimeList = await this.service.updateUserAnimeList(
      param.animeId,
      req.user.sub,
      data,
    );
    return {
      message: 'Update user anime list successfully',
      data: userAnimeList,
      statusCode: HttpStatus.OK,
    };
  }

  @Patch('/:animeId/my-list-status')
  @UseGuards(AuthGuard)
  async createOrupdateUserAnimeList(
    @Req() req: Request & { user: JwtPayload },
    @Res({ passthrough: true }) res: Response,
    @Param(new ZodValidationPipe(UserAnimeListValidation.ANIME_ID))
    param: AnimeId,
    @Body(
      new ZodValidationPipe(
        UserAnimeListValidation.CREATE_OR_UPDATE_USER_ANIME_LIST,
      ),
    )
    data: CreateOrUpdateUserAnimeList,
  ): Promise<ApiResponse<UserAnimeListWithRelation>> {
    const { statusCode, ...userAnimeList } =
      await this.service.createOrUpdateUserAnimeList(
        param.animeId,
        req.user.sub,
        data,
      );
    res.status(statusCode);
    return {
      message:
        statusCode === HttpStatus.OK
          ? 'Update user anime list successfully'
          : 'Create user anime list successfully',
      data: userAnimeList,
      statusCode: statusCode,
    };
  }

  @Delete('/:animeId/my-list-status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async deleteUserAnimeList(
    @Req() req: Request & { user: JwtPayload },
    @Param(new ZodValidationPipe(UserAnimeListValidation.ANIME_ID))
    param: AnimeId,
  ): Promise<
    ApiResponse<
      {
        id: UserAnimeList['id'];
        isSyncedWithMal: UserAnimeList['isSyncedWithMal'];
      } & {
        anime: {
          title: Anime['title'];
          malId: Anime['malId'];
        };
      } & {
        animePlatform: {
          platform: {
            name: Platform['name'];
          };
          link: {
            url: Link['url'];
          };
        } | null;
      }
    >
  > {
    const userAnimeList = await this.service.deleteUserAnimeList(
      param.animeId,
      req.user.sub,
    );
    return {
      message: 'Delete user anime list successfully',
      data: userAnimeList,
      statusCode: HttpStatus.OK,
    };
  }
}
