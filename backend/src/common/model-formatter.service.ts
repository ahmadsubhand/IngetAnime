import { Injectable } from '@nestjs/common';
import { AnimeStatus, Role } from '../generated/prisma/client';
import {
  Anime as AnimePrisma,
  AnimePlatform as AnimePlatformPrisma,
  UserAnimeList as UserAnimeListPrisma,
  Platform as PlatformPrisma,
  Link as LinkPrisma,
} from '../generated/prisma/client';
import { User } from '../modules/user/user.model';
import { Anime, AnimeWithRelation } from '../modules/anime/anime.model';
import {
  AnimePlatform,
  AnimePlatformWithRelation,
} from '../modules/anime-platform/anime-platform.model';
import {
  UserAnimeList,
  UserAnimeListWithRelation,
} from '../modules/user-anime-list/user-anime-list.model';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { SortOrder } from '../generated/prisma/internal/prismaNamespace';

dayjs.extend(utc);

@Injectable()
export class ModelFormatterService {
  dateToISOString(date?: Date | string | null): string | null {
    return date ? dayjs.utc(date).toISOString() : null;
  }

  ISOStringToYYYMMDD(date?: Date | string | null): string | null {
    return date ? dayjs.utc(date).format('YYYY-MM-DD') : null;
  }

  animePlatformsBasedOnUserSelectedPlatform(
    animePlatformA: { id: number; isMainPlatform: boolean; platformId: number },
    animePlatformB: { id: number; isMainPlatform: boolean; platformId: number },
    animePlatformId: number | null,
  ): number {
    if (
      animePlatformId &&
      (animePlatformA.id === animePlatformId ||
        animePlatformB.id === animePlatformId)
    ) {
      return (
        Number(animePlatformB.id === animePlatformId) -
        Number(animePlatformA.id === animePlatformId)
      );
    } else return 0;
  }

  countRemainingWatchableEpisodes(
    userAnimeList: {
      episodesDifference: number;
      progress: number;
      animePlatformId: number | null;
    },
    anime: { status: AnimeStatus; episodeTotal: number },
    animePlatforms: { id: number; episodeAired: number }[],
  ): number | null {
    const episodeAired =
      animePlatforms[0] &&
      animePlatforms[0].id === userAnimeList.animePlatformId
        ? animePlatforms[0].episodeAired
        : anime.status === 'finished_airing'
          ? anime.episodeTotal
          : -1;
    if (episodeAired === -1) return null;
    return (
      episodeAired - userAnimeList.episodesDifference - userAnimeList.progress
    );
  }

  public userSelect = {
    id: true,
    email: true,
    username: true,
    picture: true,
    isVerified: true,
    role: true,
    malId: true,
    googleId: true,
    updatedAt: true,
    createdAt: true,
  };

  animeInclude(userId?: number): {
    animePlatforms: {
      orderBy: [{ isMainPlatform: SortOrder }, { platformId: SortOrder }];
      include: { platform: boolean; link: boolean };
    };
    userAnimeList: {
      where: { userId?: number };
    };
  } {
    return {
      animePlatforms: {
        orderBy: [{ isMainPlatform: 'desc' }, { platformId: 'asc' }],
        include: { platform: true, link: true },
      },
      userAnimeList: {
        where: { userId },
      },
    };
  }

  public userAnimeListInclude = {
    anime: {
      include: { animePlatforms: this.animeInclude().animePlatforms },
    },
  };

  animeRequest(releaseAt?: Date | string | null): {
    releaseAt?: string | null;
  } {
    return {
      releaseAt: releaseAt ? this.dateToISOString(releaseAt) : releaseAt,
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

  userAnimeListRequest(
    startDate?: Date | string | null,
    finishDate?: Date | string | null,
  ): {
    startDate?: string | null;
    finishDate?: string | null;
  } {
    return {
      startDate: startDate ? this.dateToISOString(startDate) : startDate,
      finishDate: finishDate ? this.dateToISOString(finishDate) : finishDate,
    };
  }

  userResponse(user: {
    id: number;
    email: string | null;
    username: string;
    picture: string | null;
    isVerified: boolean;
    role: Role;
    updatedAt: Date;
    createdAt: Date;
    malId: string | null;
    googleId: string | null;
  }): User {
    return {
      ...user,
      malId: user.malId ? parseInt(user.malId) : null,
      googleId: user.googleId ? parseInt(user.googleId) : null,
      updatedAt: dayjs(user.updatedAt).toISOString(),
      createdAt: dayjs(user.createdAt).toISOString(),
    };
  }

  animeResponse(anime: AnimePrisma): Anime {
    return {
      ...anime,
      releaseAt: this.ISOStringToYYYMMDD(anime.releaseAt),
      updatedAt: dayjs(anime.updatedAt).toISOString(),
    };
  }

  animePlatformResponse(
    animePlatform: AnimePlatformPrisma & {
      platform: PlatformPrisma;
      link: LinkPrisma;
    },
  ): AnimePlatform {
    return {
      ...animePlatform,
      lastEpisodeAiredAt: animePlatform.lastEpisodeAiredAt
        ? dayjs(animePlatform.lastEpisodeAiredAt).toISOString()
        : animePlatform.lastEpisodeAiredAt,
      nextEpisodeAiringAt: animePlatform.nextEpisodeAiringAt
        ? dayjs(animePlatform.nextEpisodeAiringAt).toISOString()
        : animePlatform.nextEpisodeAiringAt,
    };
  }

  userAnimeListResponse(
    userAnimeList: UserAnimeListPrisma & {
      anime: AnimePrisma;
      animePlatform: AnimePlatformPrisma | null;
    },
  ): UserAnimeList {
    return {
      ...userAnimeList,
      startDate: this.ISOStringToYYYMMDD(userAnimeList.startDate),
      finishDate: this.ISOStringToYYYMMDD(userAnimeList.finishDate),
      updatedAt: dayjs(userAnimeList.updatedAt).toISOString(),
      remainingWatchableEpisodes: this.countRemainingWatchableEpisodes(
        userAnimeList,
        userAnimeList.anime,
        userAnimeList.animePlatform ? [{ ...userAnimeList.animePlatform }] : [],
      ),
    };
  }

  animeResponseWithRelation(
    anime: AnimePrisma & {
      animePlatforms: (AnimePlatformPrisma & {
        platform: PlatformPrisma;
        link: LinkPrisma;
      })[];
      userAnimeList: UserAnimeListPrisma[];
    },
  ): AnimeWithRelation {
    return {
      ...this.animeResponse(anime),
      animePlatforms: [...anime.animePlatforms]
        .map((animePlatform) => this.animePlatformResponse(animePlatform))
        .sort((a, b) => {
          return this.animePlatformsBasedOnUserSelectedPlatform(
            a,
            b,
            anime.userAnimeList[0].animePlatformId,
          );
        }),
      userAnimeList: this.userAnimeListResponse({
        ...anime.userAnimeList[0],
        anime: anime,
        animePlatform: anime.animePlatforms[0],
      }),
    };
  }

  animePlatformWithRelation(
    animePlatform: AnimePlatformPrisma & {
      platform: PlatformPrisma;
      link: LinkPrisma;
      anime: AnimePrisma;
    },
  ): AnimePlatformWithRelation {
    return {
      ...this.animePlatformResponse(animePlatform),
      anime: this.animeResponse(animePlatform.anime),
    };
  }

  userAnimeListWithRelation(
    userAnimeList: UserAnimeListPrisma & {
      anime: AnimePrisma;
      animePlatform:
        | (AnimePlatformPrisma & {
            platform: PlatformPrisma;
            link: LinkPrisma;
          })
        | null;
    },
  ): UserAnimeListWithRelation {
    return {
      ...this.userAnimeListResponse(userAnimeList),
      anime: this.animeResponse(userAnimeList.anime),
      animePlatform: userAnimeList.animePlatform
        ? this.animePlatformResponse(userAnimeList.animePlatform)
        : null,
    };
  }
}
