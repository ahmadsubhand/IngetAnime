import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { MalService } from '../common/mal.service';
import { ConfigService } from '@nestjs/config';
import {
  AnimeList,
  AnimePlatformResponse,
  AnimeResponse,
  MalError,
  MalListAnime,
  PlatformResponse,
} from '../types';
import { CreateAnime, GetAnimeList, UpdateAnime } from './anime.validation';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Prisma } from '../generated/prisma/client';
import { DateFormatterService } from '../common/date-formatter.service';

dayjs.extend(utc);

@Injectable()
export class AnimeService {
  private CLIENT_ID: string;
  constructor(
    private prisma: PrismaService,
    private mal: MalService,
    private config: ConfigService,
    private dateFormatter: DateFormatterService,
  ) {
    this.CLIENT_ID = this.config.getOrThrow('MAL_CLIENT_ID');
  }

  getServerPageLink(link: string) {
    const port = this.config.get<number>('PORT', 3000);
    const baseUrl = this.config.get<string>('BASE_URL', 'http://localhost');
    const queryLink = link.split('?')[1];
    return `${baseUrl}:${port}?${queryLink}`;
  }

  async getMalConnection(userId?: number): Promise<string | undefined> {
    if (!userId) {
      return undefined;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        malAccessToken: true,
        malRefreshToken: true,
      },
    });

    if (!user || !user.malAccessToken || !user.malRefreshToken) {
      return undefined;
    }

    try {
      // Check token validity
      await this.mal.getProfile(user.malAccessToken);
      return user.malAccessToken;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        const { access_token, refresh_token } =
          await this.mal.getNewAccessToken(user.malRefreshToken);

        await this.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            malAccessToken: access_token,
            malRefreshToken: refresh_token,
          },
        });

        return access_token;
      }
    }
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

  async getAnimeList(data: GetAnimeList, userId?: number): Promise<AnimeList> {
    const accessToken = await this.getMalConnection(userId);
    const url = `https://api.myanimelist.net/v2/anime`;
    const params = new URLSearchParams({
      q: data.q,
      ...(data.limit && { limit: data.limit.toString() }),
      ...(data.offset && { offset: data.offset.toString() }),
      ...(data.fields && { fields: data.fields }),
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        ...(accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : { 'X-MAL-CLIENT-ID': this.CLIENT_ID }),
      },
    });
    const animeFromMal = (await response.json()) as MalListAnime | MalError;
    if ('error' in animeFromMal) {
      throw new BadRequestException(
        animeFromMal.hint || animeFromMal.message || animeFromMal.error,
      );
    }

    const animeList = animeFromMal.data.map((anime) => anime.node);
    const prevListLink = animeFromMal.paging?.prev
      ? this.getServerPageLink(animeFromMal.paging?.prev)
      : undefined;
    const nextListLink = animeFromMal.paging?.next
      ? this.getServerPageLink(animeFromMal.paging?.next)
      : undefined;

    return {
      anime: animeList,
      ...((prevListLink || nextListLink) && {
        paging: {
          prev: prevListLink,
          next: nextListLink,
        },
      }),
    };
  }
}
