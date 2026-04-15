import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { MalService } from '../../common/mal.service';
import {
  AnimeSeason,
  GetAnimeList,
  GetAnimeRanking,
  GetSeasonalAnime,
  GetSuggestedAnime,
} from './anime-exploration.validation';
import { AnimeListResponse } from '../../types/entity';
import { ConfigService } from '@nestjs/config';
import { MalError, MalListAnime } from '../../types/mal';

@Injectable()
export class AnimeExplorationService {
  private CLIENT_ID: string;

  constructor(
    private config: ConfigService,
    private mal: MalService,
  ) {
    this.CLIENT_ID = this.config.getOrThrow('MAL_CLIENT_ID');
  }

  getServerPageLink(link: string, endpoint: string) {
    const port = this.config.get<number>('PORT', 3000);
    const baseUrl = this.config.get<string>('BASE_URL', 'http://localhost');
    const queryLink = link.split('?')[1];
    return `${baseUrl}:${port}${endpoint}?${queryLink}`;
  }

  requiredParams(params: { limit: number; offset: number; fields: string }) {
    return {
      limit: params.limit.toString(),
      offset: params.offset.toString(),
      fields: params.fields,
    };
  }

  async getAnimeList(
    data: GetAnimeList,
    userId?: number,
  ): Promise<AnimeListResponse> {
    const accessToken = await this.mal.getMalConnection(userId);
    const endpoint = '/anime';
    const url = `https://api.myanimelist.net/v2${endpoint}`;
    const params = new URLSearchParams({
      q: data.q,
      ...this.requiredParams(data),
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

    const animeList = await this.mal.insertAnimePlatformsToAnime(
      animeFromMal.data,
      userId,
    );
    const prevListLink = animeFromMal.paging?.prev
      ? this.getServerPageLink(animeFromMal.paging?.prev, endpoint)
      : undefined;
    const nextListLink = animeFromMal.paging?.next
      ? this.getServerPageLink(animeFromMal.paging?.next, endpoint)
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

  async getAnimeRanking(
    data: GetAnimeRanking,
    userId?: number,
  ): Promise<AnimeListResponse> {
    const accessToken = await this.mal.getMalConnection(userId);
    const endpoint = '/anime/ranking';
    const url = `https://api.myanimelist.net/v2${endpoint}`;
    const params = new URLSearchParams({
      ranking_type: data.ranking_type,
      ...this.requiredParams(data),
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

    const animeList = await this.mal.insertAnimePlatformsToAnime(
      animeFromMal.data,
      userId,
    );
    const prevListLink = animeFromMal.paging?.prev
      ? this.getServerPageLink(animeFromMal.paging?.prev, endpoint)
      : undefined;
    const nextListLink = animeFromMal.paging?.next
      ? this.getServerPageLink(animeFromMal.paging?.next, endpoint)
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

  async getSeasonalAnime(
    data: GetSeasonalAnime,
    param: AnimeSeason,
    userId?: number,
  ): Promise<AnimeListResponse> {
    const accessToken = await this.mal.getMalConnection(userId);
    const endpoint = `/anime/season/${param.year}/${param.season}`;
    const url = `https://api.myanimelist.net/v2${endpoint}`;
    const params = new URLSearchParams({
      ...(data.sort && { sort: data.sort }),
      ...this.requiredParams(data),
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

    const animeList = await this.mal.insertAnimePlatformsToAnime(
      animeFromMal.data,
      userId,
    );
    const prevListLink = animeFromMal.paging?.prev
      ? this.getServerPageLink(animeFromMal.paging?.prev, endpoint)
      : undefined;
    const nextListLink = animeFromMal.paging?.next
      ? this.getServerPageLink(animeFromMal.paging?.next, endpoint)
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

  async getSuggestedAnime(
    data: GetSuggestedAnime,
    userId: number,
  ): Promise<AnimeListResponse> {
    const accessToken = await this.mal.getMalConnection(userId);
    if (!accessToken) {
      throw new ForbiddenException('Account not connected to MyAnimeList');
    }
    const endpoint = '/anime/suggestions';
    const url = `https://api.myanimelist.net/v2${endpoint}`;
    const params = new URLSearchParams({
      ...this.requiredParams(data),
    });

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const animeFromMal = (await response.json()) as MalListAnime | MalError;
    if ('error' in animeFromMal) {
      throw new BadRequestException(
        animeFromMal.hint || animeFromMal.message || animeFromMal.error,
      );
    }

    const animeList = await this.mal.insertAnimePlatformsToAnime(
      animeFromMal.data,
      userId,
    );
    const prevListLink = animeFromMal.paging?.prev
      ? this.getServerPageLink(animeFromMal.paging?.prev, endpoint)
      : undefined;
    const nextListLink = animeFromMal.paging?.next
      ? this.getServerPageLink(animeFromMal.paging?.next, endpoint)
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
