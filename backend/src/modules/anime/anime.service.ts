import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  AnimePlatformResponse,
  AnimeResponse,
  PlatformResponse,
} from '../../types/entity';
import { CreateAnime, UpdateAnime } from './anime.validation';
import { Prisma } from '../../generated/prisma/client';
import { DateFormatterService } from '../../common/date-formatter.service';

@Injectable()
export class AnimeService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private dateFormatter: DateFormatterService,
  ) {}

  getServerPageLink(link: string) {
    const port = this.config.get<number>('PORT', 3000);
    const baseUrl = this.config.get<string>('BASE_URL', 'http://localhost');
    const queryLink = link.split('?')[1];
    return `${baseUrl}:${port}?${queryLink}`;
  }

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

  async getAnimeDetail(id: number): Promise<
    AnimeResponse & {
      platforms: (AnimePlatformResponse & {
        platform: PlatformResponse;
      })[];
    }
  > {
    const anime = await this.prisma.anime.findUnique({
      where: {
        id,
      },
      include: {
        platforms: {
          include: {
            platform: true,
            link: true,
          },
        },
      },
    });

    if (!anime) {
      throw new NotFoundException('Anime not found');
    }

    const animePlatforms = anime.platforms.map((animePlatform) => {
      return {
        ...animePlatform,
        ...this.dateFormatter.animePlatformResponse(
          animePlatform.lastEpisodeAiredAt,
          animePlatform.nextEpisodeAiringAt,
        ),
      };
    });

    return {
      ...anime,
      ...this.dateFormatter.animeResponse(anime.releaseAt, anime.updateAt),
      platforms: animePlatforms || [],
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
