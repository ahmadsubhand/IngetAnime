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
  Res,
  UseGuards,
} from '@nestjs/common';
import { AnimePlatformService } from './anime-platform.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AnimePlatformValidation } from './anime-platform.validator';
import type {
  AnimePlatformId,
  CreateAnimePlatform,
  CreateOrUpdateAnimePlatform,
  UpdateAnimePlatform,
} from './anime-platform.validator';
import {
  AnimePlatformResponse,
  AnimeResponse,
  ApiResponse,
  LinkResponse,
  PlatformResponse,
} from '../types';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Role } from '../auth/decorator/role.decarator';
import type { Response } from 'express';

@Controller('/anime')
export class AnimePlatformController {
  constructor(private service: AnimePlatformService) {}

  @Post('/:animeId/platform/:platformId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Role('admin')
  async createAnimePlatform(
    @Param(new ZodValidationPipe(AnimePlatformValidation.ANIME_PLATFORM_ID))
    param: AnimePlatformId,
    @Body(new ZodValidationPipe(AnimePlatformValidation.CREATE_ANIME_PLATFORM))
    data: CreateAnimePlatform,
  ): Promise<
    ApiResponse<
      Omit<AnimePlatformResponse, 'link'> & {
        platform: { name: PlatformResponse['name'] };
      } & {
        anime: { title: AnimeResponse['title'] };
      } & {
        link: { url: LinkResponse['url'] };
      }
    >
  > {
    const animePlatform = await this.service.createAnimePlatform(param, data);
    return {
      message: 'Create anime platform successfully',
      data: animePlatform,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get('/:animeId/platform/:platformId')
  @HttpCode(HttpStatus.OK)
  async getAnimePlatformDetail(
    @Param(new ZodValidationPipe(AnimePlatformValidation.ANIME_PLATFORM_ID))
    param: AnimePlatformId,
  ): Promise<
    ApiResponse<
      AnimePlatformResponse & { platform: PlatformResponse } & {
        anime: AnimeResponse;
      }
    >
  > {
    const animePlatform = await this.service.getAnimePlatformDetail(param);
    return {
      message: 'Get anime platform detail successfully',
      data: animePlatform,
      statusCode: HttpStatus.OK,
    };
  }

  @Put('/:animeId/platform/:platformId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Role('admin')
  async updateAnimePlatform(
    @Param(new ZodValidationPipe(AnimePlatformValidation.ANIME_PLATFORM_ID))
    param: AnimePlatformId,
    @Body(new ZodValidationPipe(AnimePlatformValidation.UPDATE_ANIME_PLATFORM))
    data: UpdateAnimePlatform,
  ): Promise<
    ApiResponse<
      Omit<AnimePlatformResponse, 'link'> & {
        platform: { name: PlatformResponse['name'] };
      } & {
        anime: { title: AnimeResponse['title'] };
      } & {
        link: { url: LinkResponse['url'] };
      }
    >
  > {
    const animePlatform = await this.service.updateAnimePlatform(param, data);
    return {
      message: 'Update anime platform successfully',
      data: animePlatform,
      statusCode: HttpStatus.OK,
    };
  }

  @Patch('/:animeId/platform/:platformId')
  @UseGuards(AuthGuard)
  @Role('admin')
  async createOrUpdateAnimePlatform(
    @Param(new ZodValidationPipe(AnimePlatformValidation.ANIME_PLATFORM_ID))
    param: AnimePlatformId,
    @Body(
      new ZodValidationPipe(
        AnimePlatformValidation.CREATE_OR_UPDATE_ANIME_PLATFORM,
      ),
    )
    data: CreateOrUpdateAnimePlatform,
    @Res({ passthrough: true }) res: Response,
  ): Promise<
    ApiResponse<
      Omit<AnimePlatformResponse, 'link'> & {
        platform: { name: PlatformResponse['name'] };
      } & {
        anime: { title: AnimeResponse['title'] };
      } & {
        link: { url: LinkResponse['url'] };
      }
    >
  > {
    const { statusCode, ...animePlatform } =
      await this.service.createOrUpdateAnimePlatform(param, data);

    res.status(statusCode);
    return {
      message:
        statusCode === HttpStatus.OK
          ? 'Update anime platform successfully'
          : 'Create anime platform successfully',
      data: animePlatform,
      statusCode: statusCode,
    };
  }

  @Delete('/:animeId/platform/:platformId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Role('admin')
  async deleteAnimePlatform(
    @Param(new ZodValidationPipe(AnimePlatformValidation.ANIME_PLATFORM_ID))
    param: AnimePlatformId,
  ): Promise<
    ApiResponse<
      {
        id: AnimePlatformResponse['id'];
      } & {
        platform: { name: PlatformResponse['name'] };
      } & {
        anime: { title: AnimeResponse['title'] };
      }
    >
  > {
    const animePlatform = await this.service.deleteAnimePlatform(param);
    return {
      message: 'Delete anime platform successfully',
      data: animePlatform,
      statusCode: HttpStatus.OK,
    };
  }
}
