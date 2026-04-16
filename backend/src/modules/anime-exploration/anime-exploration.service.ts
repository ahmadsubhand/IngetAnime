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
import { AllAnimeWithMal } from './anime-exploration.model';
import { ConfigService } from '@nestjs/config';
import { MalError, AllMalAnime } from '../../types/mal';
import { ModelPaginationService } from '../../common/model-pagination.service';
import { ModelSortService } from '../../common/model-sort.service';
import { ModelCountService } from '../../common/model-count.service';
import { DateFormatterService } from '../../common/date-formatter.service';

@Injectable()
export class AnimeExplorationService {
  private CLIENT_ID: string;

  constructor(
    private config: ConfigService,
    private mal: MalService,
    private dateFormatter: DateFormatterService,
    private modelPagination: ModelPaginationService,
    private modelSort: ModelSortService,
    private modelCount: ModelCountService,
  ) {
    this.CLIENT_ID = this.config.getOrThrow('MAL_CLIENT_ID');
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
  ): Promise<AllAnimeWithMal> {
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
    const animeFromMal = (await response.json()) as AllMalAnime | MalError;
    if ('error' in animeFromMal) {
      throw new BadRequestException(
        animeFromMal.hint || animeFromMal.message || animeFromMal.error,
      );
    }

    const animeList = await this.mal.insertAnimePlatformsToAnime(
      animeFromMal.data,
      userId,
    );

    return {
      anime: [...animeList].map((anime) => ({
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
          remainingWatchableEpisodes:
            this.modelCount.countRemainingWatchableEpisodes(
              anime.userAnimeList[0],
              anime,
              anime.animePlatforms,
            ),
        },
      })),
      ...this.modelPagination.getServerPageLink(
        endpoint,
        animeFromMal.paging?.prev,
        animeFromMal.paging?.next,
      ),
    };
  }

  async getAnimeRanking(
    data: GetAnimeRanking,
    userId?: number,
  ): Promise<AllAnimeWithMal> {
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
    const animeFromMal = (await response.json()) as AllMalAnime | MalError;
    if ('error' in animeFromMal) {
      throw new BadRequestException(
        animeFromMal.hint || animeFromMal.message || animeFromMal.error,
      );
    }

    const animeList = await this.mal.insertAnimePlatformsToAnime(
      animeFromMal.data,
      userId,
    );

    return {
      anime: [...animeList].map((anime) => ({
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
          remainingWatchableEpisodes:
            this.modelCount.countRemainingWatchableEpisodes(
              anime.userAnimeList[0],
              anime,
              anime.animePlatforms,
            ),
        },
      })),
      ...this.modelPagination.getServerPageLink(
        endpoint,
        animeFromMal.paging?.prev,
        animeFromMal.paging?.next,
      ),
    };
  }

  async getSeasonalAnime(
    data: GetSeasonalAnime,
    param: AnimeSeason,
    userId?: number,
  ): Promise<AllAnimeWithMal> {
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
    const animeFromMal = (await response.json()) as AllMalAnime | MalError;
    if ('error' in animeFromMal) {
      throw new BadRequestException(
        animeFromMal.hint || animeFromMal.message || animeFromMal.error,
      );
    }

    const animeList = await this.mal.insertAnimePlatformsToAnime(
      animeFromMal.data,
      userId,
    );

    return {
      anime: [...animeList].map((anime) => ({
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
          remainingWatchableEpisodes:
            this.modelCount.countRemainingWatchableEpisodes(
              anime.userAnimeList[0],
              anime,
              anime.animePlatforms,
            ),
        },
      })),
      ...this.modelPagination.getServerPageLink(
        endpoint,
        animeFromMal.paging?.prev,
        animeFromMal.paging?.next,
      ),
    };
  }

  async getSuggestedAnime(
    data: GetSuggestedAnime,
    userId: number,
  ): Promise<AllAnimeWithMal> {
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
    const animeFromMal = (await response.json()) as AllMalAnime | MalError;
    if ('error' in animeFromMal) {
      throw new BadRequestException(
        animeFromMal.hint || animeFromMal.message || animeFromMal.error,
      );
    }

    const animeList = await this.mal.insertAnimePlatformsToAnime(
      animeFromMal.data,
      userId,
    );

    return {
      anime: [...animeList].map((anime) => ({
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
          remainingWatchableEpisodes:
            this.modelCount.countRemainingWatchableEpisodes(
              anime.userAnimeList[0],
              anime,
              anime.animePlatforms,
            ),
        },
      })),
      ...this.modelPagination.getServerPageLink(
        endpoint,
        animeFromMal.paging?.prev,
        animeFromMal.paging?.next,
      ),
    };
  }
}
