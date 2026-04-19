import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AnimeExplorationService } from './anime-exploration.service';
import { AuthGuard, OptionalAuthGuard } from '../auth/guard/auth.guard';
import { Request } from 'express';
import { JwtPayload } from '../../types';
import type {
  GetAnimeRanking,
  GetAnimeList,
  AnimeSeason,
  GetSeasonalAnime,
  GetSuggestedAnime,
  GetAnimeTimeline,
} from './anime-exploration.validation';
import { AnimeExplorationValidation } from './anime-exploration.validation';
import { ApiResponse } from '../../types';
import { AnimeDailyTimeline, AllAnimeWithMal } from './anime-exploration.model';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { SkipThrottle } from '@nestjs/throttler';

@Controller('anime')
@SkipThrottle()
export class AnimeExplorationController {
  constructor(private service: AnimeExplorationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  async getAnimeList(
    @Req() req: Request & { user?: JwtPayload },
    @Query(new ZodValidationPipe(AnimeExplorationValidation.GET_ANIME_LIST))
    data: GetAnimeList,
  ): Promise<ApiResponse<AllAnimeWithMal>> {
    const animeList = await this.service.getAnimeList(data, req.user?.sub);
    return {
      message: 'Get anime list successfully',
      data: animeList,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('ranking')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  async getAnimeRanking(
    @Req() req: Request & { user?: JwtPayload },
    @Query(new ZodValidationPipe(AnimeExplorationValidation.GET_ANIME_RANKING))
    data: GetAnimeRanking,
  ): Promise<ApiResponse<AllAnimeWithMal>> {
    const animeList = await this.service.getAnimeRanking(data, req.user?.sub);
    return {
      message: 'Get anime ranking successfully',
      data: animeList,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('/season/:year/:season')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  async getSeasonalAnime(
    @Req() req: Request & { user?: JwtPayload },
    @Param(new ZodValidationPipe(AnimeExplorationValidation.ANIME_SEASON))
    param: AnimeSeason,
    @Query(new ZodValidationPipe(AnimeExplorationValidation.GET_SEASONAL_ANIME))
    data: GetSeasonalAnime,
  ): Promise<ApiResponse<AllAnimeWithMal>> {
    const animeList = await this.service.getSeasonalAnime(
      data,
      param,
      req.user?.sub,
    );
    return {
      message: 'Get seasonal anime successfully',
      data: animeList,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('suggestions')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getSuggestedAnime(
    @Req() req: Request & { user: JwtPayload },
    @Query(
      new ZodValidationPipe(AnimeExplorationValidation.GET_SUGGESTED_ANIME),
    )
    data: GetSuggestedAnime,
  ): Promise<ApiResponse<AllAnimeWithMal>> {
    const animeList = await this.service.getSuggestedAnime(data, req.user.sub);
    return {
      message: 'Get suggessted anime successfully',
      data: animeList,
      statusCode: HttpStatus.OK,
    };
  }

  @Get('timeline')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  async getAnimeTimeline(
    @Req() req: Request & { user?: JwtPayload },
    @Query(new ZodValidationPipe(AnimeExplorationValidation.GET_ANIME_TIMELINE))
    data: GetAnimeTimeline,
  ): Promise<ApiResponse<AnimeDailyTimeline[]>> {
    const timelines = await this.service.getAnimeTimeline(data, req.user?.sub);
    return {
      message: 'Get anime timeline successfully',
      data: timelines,
      statusCode: HttpStatus.OK,
    };
  }
}
