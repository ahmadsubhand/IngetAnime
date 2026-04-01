import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { MalService } from '../common/mal.service';
import { ConfigService } from '@nestjs/config';
import { AnimeList, MalError, MalListAnime } from '../types';
import { GetAnimeList } from './anime.validation';

@Injectable()
export class AnimeService {
  private CLIENT_ID: string;
  constructor(
    private prisma: PrismaService,
    private mal: MalService,
    private config: ConfigService,
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
