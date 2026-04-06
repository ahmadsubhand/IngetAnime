import { Injectable } from '@nestjs/common';
import { UtcService } from './utc.service';
import dayjs from 'dayjs';

@Injectable()
export class DateFormatterService {
  constructor(private utc: UtcService) {}

  // Why need different request and response?
  // Some request need undefined whereas request avoid undefined

  animeRequest(releaseAt?: Date | string | null): {
    releaseAt?: string | null;
  } {
    return {
      releaseAt: releaseAt ? this.utc.dateToISOString(releaseAt) : releaseAt,
    };
  }

  animeResponse(
    releaseAt: Date | string | null,
    updateAt: Date | string,
  ): {
    releaseAt: string | null;
    updateAt: string;
  } {
    return {
      releaseAt: this.utc.ISOStringToYYYMMDD(releaseAt),
      updateAt: dayjs(updateAt).toISOString(),
    };
  }

  animePlatformRequest(
    lastEpisodeAiredAt?: Date | string | null,
    nextEpisodeAiringAt?: Date | string | null,
  ): {
    lastEpisodeAiredAt?: string | null;
    nextEpisodeAiringAt?: string | null;
  } {
    return {
      lastEpisodeAiredAt: lastEpisodeAiredAt
        ? dayjs(lastEpisodeAiredAt).toISOString()
        : lastEpisodeAiredAt,
      nextEpisodeAiringAt: nextEpisodeAiringAt
        ? dayjs(nextEpisodeAiringAt).toISOString()
        : nextEpisodeAiringAt,
    };
  }

  animePlatformResponse(
    lastEpisodeAiredAt: Date | string | null,
    nextEpisodeAiringAt: Date | string | null,
  ): {
    lastEpisodeAiredAt: string | null;
    nextEpisodeAiringAt: string | null;
  } {
    return {
      lastEpisodeAiredAt: lastEpisodeAiredAt
        ? dayjs(lastEpisodeAiredAt).toISOString()
        : lastEpisodeAiredAt,
      nextEpisodeAiringAt: nextEpisodeAiringAt
        ? dayjs(nextEpisodeAiringAt).toISOString()
        : nextEpisodeAiringAt,
    };
  }

  userAnimeListRequest(
    startDate?: Date | string | null,
    finishDate?: Date | string | null,
  ): {
    startDate?: string | null;
    finishDate?: string | null;
  } {
    return {
      startDate: startDate ? this.utc.dateToISOString(startDate) : startDate,
      finishDate: finishDate
        ? this.utc.dateToISOString(finishDate)
        : finishDate,
    };
  }

  userAnimeListResponse(
    startDate: Date | string | null,
    finishDate: Date | string | null,
    updateAt: Date | string,
  ): {
    startDate: string | null;
    finishDate: string | null;
    updateAt: string;
  } {
    return {
      startDate: this.utc.ISOStringToYYYMMDD(startDate),
      finishDate: this.utc.ISOStringToYYYMMDD(finishDate),
      updateAt: dayjs(updateAt).toISOString(),
    };
  }
}
