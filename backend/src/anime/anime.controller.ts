import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AnimeService } from './anime.service';
import { AnimeList, ApiResponse, JwtPayload } from '../types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AnimeValidation } from './anime.validation';
import type { GetAnimeList } from './anime.validation';
import { OptionalAuthGuard } from '../auth/guard/auth.guard';

@Controller('anime')
@SkipThrottle()
export class AnimeController {
  constructor(private service: AnimeService) {}

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
