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
import { AuthGuard } from '@nestjs/passport';
import { AnimeList, ApiResponse, JwtPayload } from '../types';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AnimeValidation } from './anime.validation';
import type { GetAnimeList } from './anime.validation';

@Controller('anime')
@SkipThrottle()
export class AnimeController {
  constructor(private service: AnimeService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async getAnimeList(
    @Req() req: { user: JwtPayload },
    @Query(new ZodValidationPipe(AnimeValidation.GET_ANIME_LIST))
    data: GetAnimeList,
  ): Promise<ApiResponse<AnimeList>> {
    const animeList = await this.service.getAnimeList(req.user.sub, data);
    return {
      message: 'Get all anime list success',
      data: animeList,
      statusCode: HttpStatus.OK,
    };
  }
}
