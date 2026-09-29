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
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AnimeService } from './anime.service';
import { AnimeWithRelation, Anime } from './anime.model';
import { ApiResponse } from '../../types';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { AnimeValidation } from './anime.validation';
import type { AnimeId, CreateAnime, UpdateAnime } from './anime.validation';
import { AuthGuard, OptionalAuthGuard } from '../auth/guard/auth.guard';
import { Role } from '../auth/decorator/role.decarator';
import { Request } from 'express';
import { JwtPayload } from '../../types';

@Controller('anime')
export class AnimeController {
  constructor(private service: AnimeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Role('admin')
  async createAnime(
    @Body(new ZodValidationPipe(AnimeValidation.CREATE_ANIME))
    data: CreateAnime,
  ): Promise<ApiResponse<Anime>> {
    const anime = await this.service.createAnime(data);
    return {
      message: 'Create anime successfully',
      data: anime,
      statusCode: HttpStatus.CREATED,
    };
  }

  @SkipThrottle()
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  async getAnimeDetail(
    @Req() req: Request & { user?: JwtPayload },
    @Param(new ZodValidationPipe(AnimeValidation.ANIME_ID))
    data: AnimeId,
  ): Promise<ApiResponse<AnimeWithRelation>> {
    const anime = await this.service.getAnimeDetail(data.id, req.user?.sub);
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
  ): Promise<ApiResponse<Anime>> {
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
  ): Promise<ApiResponse<{ id: Anime['id']; title: Anime['title'] }>> {
    const anime = await this.service.deleteAnime(data.id);
    return {
      message: 'Delete anime successfully',
      data: anime,
      statusCode: HttpStatus.OK,
    };
  }
}
