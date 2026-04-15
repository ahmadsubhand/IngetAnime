import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { AnimeFullRelation, AnimeResponse } from '../../types/entity';
import { CreateAnime, UpdateAnime } from './anime.validation';
import { Prisma } from '../../generated/prisma/client';
import { DateFormatterService } from '../../common/date-formatter.service';
import { ModelSortService } from '../../common/model-sort.service';

@Injectable()
export class AnimeService {
  constructor(
    private prisma: PrismaService,
    private dateFormatter: DateFormatterService,
    private modelSort: ModelSortService,
  ) {}

  async createAnime(data: CreateAnime): Promise<AnimeResponse> {
    try {
      const anime = await this.prisma.anime.create({
        data: {
          ...data,
          ...this.dateFormatter.animeRequest(data.releaseAt),
        },
      });

      return {
        ...anime,
        ...this.dateFormatter.animeResponse(anime.releaseAt, anime.updateAt),
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Anime already exists');
      }

      throw error;
    }
  }

  async getAnimeDetail(
    id: number,
    userId?: number,
  ): Promise<AnimeResponse & AnimeFullRelation> {
    const anime = await this.prisma.anime.findUnique({
      where: {
        id,
      },
      include: {
        animePlatforms: {
          orderBy: [{ isMainPlatform: 'desc' }, { platformId: 'asc' }],
          include: {
            platform: true,
            link: true,
          },
        },
        userAnimeList: {
          where: {
            userId,
          },
        },
      },
    });

    if (!anime) {
      throw new NotFoundException('Anime not found');
    }

    return {
      ...anime,
      ...this.dateFormatter.animeResponse(anime.releaseAt, anime.updateAt),
      animePlatforms: [...anime.animePlatforms]
        .map((animePlatform) => ({
          ...animePlatform,
          ...this.dateFormatter.animePlatformResponse(
            animePlatform.lastEpisodeAiredAt,
            animePlatform.nextEpisodeAiringAt,
          ),
        }))
        .sort((a, b) => {
          return this.modelSort.animePlatformsBasedOnUserSelectedPlatform(
            a,
            b,
            anime.userAnimeList[0].animePlatformId,
          );
        }),
      userAnimeList: {
        ...anime.userAnimeList[0],
        ...this.dateFormatter.userAnimeListResponse(
          anime.userAnimeList[0].startDate,
          anime.userAnimeList[0].finishDate,
          anime.userAnimeList[0].updatedAt,
        ),
      },
    };
  }

  async updateAnime(
    animeId: number,
    data: UpdateAnime,
  ): Promise<AnimeResponse> {
    try {
      const anime = await this.prisma.anime.update({
        where: {
          id: animeId,
        },
        data: {
          ...data,
          ...this.dateFormatter.animeRequest(data.releaseAt),
        },
      });

      return {
        ...anime,
        ...this.dateFormatter.animeResponse(anime.releaseAt, anime.updateAt),
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Anime already exists');
        } else if (error.code === 'P2025') {
          throw new NotFoundException('Anime not found');
        }
      }

      throw error;
    }
  }

  async deleteAnime(
    animeId: number,
  ): Promise<{ id: AnimeResponse['id']; title: AnimeResponse['title'] }> {
    try {
      const anime = await this.prisma.anime.delete({
        where: {
          id: animeId,
        },
        select: {
          id: true,
          title: true,
        },
      });

      return anime;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Anime not found');
      }

      throw error;
    }
  }
}
