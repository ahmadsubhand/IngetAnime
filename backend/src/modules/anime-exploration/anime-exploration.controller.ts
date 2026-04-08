import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AnimeExplorationService } from './anime-exploration.service';
import { OptionalAuthGuard } from '../auth/guard/auth.guard';
import { Request } from 'express';
import { JwtPayload } from '../../types';
import {
  AnimeExplorationValidation,
  type GetAnimeList,
} from './anime-exploration.validation';
import { AnimeListResponse, ApiResponse } from '../../types/entity';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';

@Controller('anime')
export class AnimeExplorationController {
  constructor(private service: AnimeExplorationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalAuthGuard)
  async getAnimeList(
    @Req() req: Request & { user?: JwtPayload },
    @Query(new ZodValidationPipe(AnimeExplorationValidation.GET_ANIME_LIST))
    data: GetAnimeList,
  ): Promise<ApiResponse<AnimeListResponse>> {
    const animeList = await this.service.getAnimeList(data, req.user?.sub);
    return {
      message: 'Get anime list successfully',
      data: animeList,
      statusCode: HttpStatus.OK,
    };
  }
}
