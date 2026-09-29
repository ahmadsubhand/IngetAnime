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
import { MyAnimeListService } from './my-anime-list.service';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiResponse, JwtPayload } from '../../types';
import { MalAnime } from './my-anime-list.model';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { MyAnimeListValidation } from './my-anime-list.validation';
import type { AnimeId, Fields } from './my-anime-list.validation';
import { OptionalAuthGuard } from '../auth/guard/auth.guard';
import { Request } from 'express';

@SkipThrottle()
@Controller('mal')
export class MyAnimeListController {
  constructor(private service: MyAnimeListService) {}

  @Get('/anime/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  async getMalAnimeDetails(
    @Req() req: Request & { user?: JwtPayload },
    @Param(new ZodValidationPipe(MyAnimeListValidation.ANIME_ID))
    param: AnimeId,
    @Query(new ZodValidationPipe(MyAnimeListValidation.FIELDS))
    data: Fields,
  ): Promise<ApiResponse<MalAnime>> {
    const animeFromMal = await this.service.getMalAnimeDetails(
      param.id,
      data.fields,
      req.user?.sub,
    );
    return {
      message: 'Get MyAnimeList anime details successfully',
      data: animeFromMal,
      statusCode: HttpStatus.OK,
    };
  }
}
