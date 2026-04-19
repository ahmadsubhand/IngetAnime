import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AnimeSeason,
  GetAnimeList,
  GetAnimeRanking,
  GetAnimeTimeline,
  GetSeasonalAnime,
  GetSuggestedAnime,
} from './anime-exploration.validation';
import {
  AnimeDailyTimeline,
  AllAnimeWithMal,
  AnimeWithSchedule,
} from './anime-exploration.model';
import { ConfigService } from '@nestjs/config';
import { MalError, AllMalAnime } from '../my-anime-list/my-anime-list.model';
import { ModelPaginationService } from '../../common/model-pagination.service';
import { ModelFormatterService } from '../../common/model-formatter.service';
import { MyAnimeListService } from '../my-anime-list/my-anime-list.service';
import { PrismaService } from '../../common/prisma.service';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

@Injectable()
export class AnimeExplorationService {
  private CLIENT_ID: string;

  constructor(
    private config: ConfigService,
    private mal: MyAnimeListService,
    private modelFormatter: ModelFormatterService,
    private modelPagination: ModelPaginationService,
    private prisma: PrismaService,
  ) {
    this.CLIENT_ID = this.config.getOrThrow('MAL_CLIENT_ID');
  }

  requiredParams(params: { limit: number; offset: number; fields: string }) {
    return {
      limit: params.limit.toString(),
      offset: params.offset.toString(),
      fields: `${this.mal.MIN_FIELDS}${params.fields}`,
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
        ...this.modelFormatter.animeResponseWithRelation(anime),
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
        ...this.modelFormatter.animeResponseWithRelation(anime),
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
        ...this.modelFormatter.animeResponseWithRelation(anime),
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
        ...this.modelFormatter.animeResponseWithRelation(anime),
      })),
      ...this.modelPagination.getServerPageLink(
        endpoint,
        animeFromMal.paging?.prev,
        animeFromMal.paging?.next,
      ),
    };
  }

  async getAnimeTimeline(
    data: GetAnimeTimeline,
    userId?: number,
  ): Promise<AnimeDailyTimeline[]> {
    const now = dayjs().toISOString();
    const localDate = dayjs(now).tz(data.time_zone);
    const startDateThisWeek = localDate
      .subtract(3 * data.week_count, 'day')
      .startOf('day');
    const endDateThisWeek = localDate
      .add(3 * data.week_count, 'day')
      .endOf('day');

    const animeFromDatabase = await this.prisma.anime.findMany({
      where: {
        animePlatforms: {
          some: {
            OR: [
              {
                lastEpisodeAiredAt: {
                  gte: startDateThisWeek.toISOString(),
                  lte: endDateThisWeek.toISOString(),
                },
              },
              {
                nextEpisodeAiringAt: {
                  gte: startDateThisWeek.toISOString(),
                  lte: endDateThisWeek.toISOString(),
                },
              },
            ],
          },
        },
        ...(data.my_list_only &&
          userId && {
            userAnimeList: {
              some: { userId },
            },
          }),
      },
      include: this.modelFormatter.animeInclude(userId),
    });
    const anime = [...animeFromDatabase].map((anime) =>
      this.modelFormatter.animeResponseWithRelation(
        anime,
        Boolean(!data.original_schedule && userId),
      ),
    );

    const animeBeforeToday: AnimeWithSchedule[] = [...anime]
      .filter((anime) => {
        if (!anime.animePlatforms[0])
          throw new InternalServerErrorException('Anime platforms not found');
        const airedAt = anime.animePlatforms[0].lastEpisodeAiredAt;
        return airedAt
          ? dayjs(airedAt).isSameOrAfter(dayjs(startDateThisWeek)) &&
              dayjs(airedAt).isSameOrBefore(dayjs())
          : false;
      })
      .sort((a, b) =>
        a.animePlatforms[0]?.lastEpisodeAiredAt &&
        b.animePlatforms[0]?.lastEpisodeAiredAt
          ? dayjs(a.animePlatforms[0].lastEpisodeAiredAt).unix() -
            dayjs(b.animePlatforms[0].lastEpisodeAiredAt).unix()
          : 0,
      )
      .map((anime) => {
        if (!anime.animePlatforms[0]?.lastEpisodeAiredAt)
          throw new InternalServerErrorException(
            'Anime platforms lastEpisodeAiredAt not found',
          );
        const episodeDifference =
          (!data.original_schedule &&
            anime.userAnimeList?.episodesDifference) ||
          0;
        return {
          schedule: {
            dateTime: anime.animePlatforms[0].lastEpisodeAiredAt,
            episodeNumber:
              anime.animePlatforms[0]?.episodeAired + episodeDifference,
          },
          ...anime,
        };
      });

    const animeAfterToday: AnimeWithSchedule[] = [...anime]
      .filter((anime) => {
        if (!anime.animePlatforms[0])
          throw new InternalServerErrorException('Anime platforms not found');
        const airedAt = anime.animePlatforms[0].nextEpisodeAiringAt;
        return airedAt
          ? dayjs(airedAt).isAfter(dayjs()) &&
              dayjs(airedAt).isSameOrBefore(dayjs(endDateThisWeek))
          : false;
      })
      .sort((a, b) =>
        a.animePlatforms[0]?.nextEpisodeAiringAt &&
        b.animePlatforms[0]?.nextEpisodeAiringAt
          ? dayjs(a.animePlatforms[0].nextEpisodeAiringAt).diff(
              dayjs(b.animePlatforms[0].nextEpisodeAiringAt),
              'minute',
            )
          : 0,
      )
      .map((anime) => {
        if (!anime.animePlatforms[0]?.nextEpisodeAiringAt)
          throw new InternalServerErrorException(
            'Anime platforms nextEpisodeAiringAt not found',
          );
        const episodeDifference =
          (!data.original_schedule &&
            anime.userAnimeList?.episodesDifference) ||
          0;
        return {
          schedule: {
            dateTime: anime.animePlatforms[0].nextEpisodeAiringAt,
            episodeNumber:
              anime.animePlatforms[0]?.episodeAired + 1 + episodeDifference,
          },
          ...anime,
        };
      });

    const animeWithSchedule = animeBeforeToday.concat(animeAfterToday);
    const MAX_NUMBER_OF_DATE = 31;
    const dailyTimelineDate: AnimeDailyTimeline[] = Array.from(
      { length: MAX_NUMBER_OF_DATE + 1 },
      () => ({
        dateTime: '',
        timelines: [],
      }),
    );

    animeWithSchedule.forEach((anime) => {
      const dateTime = dayjs(anime.schedule.dateTime);
      const date = dateTime.date();
      const hour = dateTime.hour();
      const minute = dateTime.minute();

      if (!dailyTimelineDate[date])
        throw new InternalServerErrorException('dailyTimeline not found');
      if (dailyTimelineDate[date].dateTime === '') {
        // Fill date time if currect day doesn't have it
        dailyTimelineDate[date].dateTime = dateTime
          .startOf('day')
          .toISOString();
      }

      const timeline = dailyTimelineDate[date].timelines.find((timeline) => {
        if (timeline.dateTime === '') return false;
        const dateTimeline = dayjs(timeline.dateTime);
        const hourTimeline = dateTimeline.hour();
        const minuteTimeline = dateTimeline.minute();
        if (hourTimeline === hour && minuteTimeline === minute) return true;
        return false;
      });

      if (timeline) {
        timeline.anime.push(anime);
      } else {
        dailyTimelineDate[date].timelines.push({
          dateTime: dateTime.toISOString(),
          anime: [{ ...anime }],
        });
      }
    });

    // From date 1-31, filter and sort to sequential daily timeline of the week for different month case
    const sequentialDailyTimeline = [...dailyTimelineDate]
      .filter((dailyTimeline) => dailyTimeline.dateTime !== '')
      .sort((a, b) => dayjs(a.dateTime).diff(dayjs(b.dateTime), 'minute'));

    // Fill blank timeline if one day of the week doesn't have anime schedule
    const NUMBER_OF_TIMELINE_DAYS = 1 + 3 * data.week_count * 2; // today[1] + week_count[n] * 3 * (before[1] + after[1])
    for (let i = 0; i < NUMBER_OF_TIMELINE_DAYS; i++) {
      const date = startDateThisWeek.add(i, 'day');
      const blankDailyTimeline: AnimeDailyTimeline = {
        dateTime: date.toISOString(),
        timelines: [],
      };
      const dailyTimeline = sequentialDailyTimeline.find((dailyTimeline) =>
        dayjs(dailyTimeline.dateTime).isSame(date, 'day'),
      );
      if (!dailyTimeline) {
        const index = sequentialDailyTimeline.findIndex(
          (dailyTimeline) => dayjs(dailyTimeline.dateTime).isAfter(date),
          'day',
        );
        if (index !== -1) {
          sequentialDailyTimeline.splice(index, 0, blankDailyTimeline);
        } else {
          sequentialDailyTimeline.push(blankDailyTimeline);
        }
      }
    }

    return sequentialDailyTimeline;
  }
}
