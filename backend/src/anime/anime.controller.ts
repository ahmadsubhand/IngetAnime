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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AnimeService } from './anime.service';
import {
  AnimeList,
  AnimePlatformResponse,
  AnimeResponse,
  ApiResponse,
  JwtPayload,
  PlatformResponse,
} from '../types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AnimeValidation } from './anime.validation';
import type {
  AnimeId,
  CreateAnime,
  GetAnimeList,
  UpdateAnime,
} from './anime.validation';
import { AuthGuard, OptionalAuthGuard } from '../auth/guard/auth.guard';
import { Role } from '../auth/decorator/role.decarator';

@Controller('anime')
@SkipThrottle()
export class AnimeController {
  constructor(private service: AnimeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Role('admin')
  async createAnime(
    @Body(new ZodValidationPipe(AnimeValidation.CREATE_ANIME))
    data: CreateAnime,
  ): Promise<ApiResponse<AnimeResponse>> {
    const anime = await this.service.createAnime(data);
    return {
      message: 'Create anime successfully',
      data: anime,
      statusCode: HttpStatus.CREATED,
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getAnimeDetail(
    @Param(new ZodValidationPipe(AnimeValidation.ANIME_ID))
    data: AnimeId,
  ): Promise<
    ApiResponse<
      AnimeResponse & {
        platforms: (AnimePlatformResponse & {
          platform: PlatformResponse;
        })[];
      }
    >
  > {
    const anime = await this.service.getAnimeDetail(data.id);
    return {
      message: 'Get anime detail successfully',
      data: anime,
      statusCode: HttpStatus.OK,
    };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Role('admin')
  async updateAnime(
    @Param(new ZodValidationPipe(AnimeValidation.ANIME_ID))
    param: AnimeId,
    @Body(new ZodValidationPipe(AnimeValidation.UPDATE_ANIME))
    data: UpdateAnime,
  ): Promise<ApiResponse<AnimeResponse>> {
    const anime = await this.service.updateAnime(param.id, data);
    return {
      message: 'Update anime successfully',
      data: anime,
      statusCode: HttpStatus.OK,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @Role('admin')
  async deleteAnime(
    @Param(new ZodValidationPipe(AnimeValidation.ANIME_ID)) data: AnimeId,
  ): Promise<
    ApiResponse<{ id: AnimeResponse['id']; title: AnimeResponse['title'] }>
  > {
    const anime = await this.service.deleteAnime(data.id);
    return {
      message: 'Delete anime successfully',
      data: anime,
      statusCode: HttpStatus.OK,
    };
  }

  @Get()
  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAnimeList(
    @Req() req: { user?: JwtPayload },
    @Query(new ZodValidationPipe(AnimeValidation.GET_ANIME_LIST))
    data: GetAnimeList,
  ): Promise<ApiResponse<AnimeList>> {
    const animeList = await this.service.getAnimeList(data, req.user?.sub);
    return {
      message: 'Get all anime list success',
      data: animeList,
      statusCode: HttpStatus.OK,
    };
  }
}
