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

export function dateToISOString(date?: Date | string | null): string | null {
  return date ? dayjs.utc(date).toISOString() : null;
}

export function ISOStringToYYYMMDD(date?: Date | string | null): string | null {
  return date ? dayjs.utc(date).format('YYYY-MM-DD') : null;
}

export function animePlatformsBasedOnUserSelectedPlatform(
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

export function countRemainingWatchableEpisodes(
  userAnimeList: {
    episodesDifference: number;
    progress: number;
    animePlatformId: number | null;
  },
  anime: { status: AnimeStatus; episodeTotal: number },
  animePlatforms: { id: number; episodeAired: number }[],
): number | null {
  const episodeAired =
    animePlatforms[0] && animePlatforms[0].id === userAnimeList.animePlatformId
      ? animePlatforms[0].episodeAired
      : anime.status === 'finished_airing'
        ? anime.episodeTotal
        : -1;
  if (episodeAired === -1) return null;
  return (
    episodeAired - userAnimeList.episodesDifference - userAnimeList.progress
  );
}

export const userSelect = {
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

export function animeInclude(userId?: number): {
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

export const userAnimeListInclude = {
  anime: {
    include: { animePlatforms: animeInclude().animePlatforms },
  },
};

export function animeRequest(releaseAt?: Date | string | null): {
  releaseAt?: string | null;
} {
  return {
    releaseAt: releaseAt ? dateToISOString(releaseAt) : releaseAt,
  };
}

export function animePlatformRequest(
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

export function userAnimeListRequest(
  startDate?: Date | string | null,
  finishDate?: Date | string | null,
): {
  startDate?: string | null;
  finishDate?: string | null;
} {
  return {
    startDate: startDate ? dateToISOString(startDate) : startDate,
    finishDate: finishDate ? dateToISOString(finishDate) : finishDate,
  };
}

export function userResponse(user: {
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

export function animeResponse(anime: AnimePrisma): Anime {
  return {
    ...anime,
    releaseAt: ISOStringToYYYMMDD(anime.releaseAt),
    updatedAt: dayjs(anime.updatedAt).toISOString(),
  };
}

export function animePlatformResponse(
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

export function userAnimeListResponse(
  userAnimeList: UserAnimeListPrisma & {
    anime: AnimePrisma;
    animePlatform: AnimePlatformPrisma | null;
  },
): UserAnimeList {
  const { anime, animePlatform, ...pureUserAnimeList } = userAnimeList;
  return {
    ...pureUserAnimeList,
    startDate: ISOStringToYYYMMDD(pureUserAnimeList.startDate),
    finishDate: ISOStringToYYYMMDD(pureUserAnimeList.finishDate),
    updatedAt: dayjs(pureUserAnimeList.updatedAt).toISOString(),
    remainingWatchableEpisodes: countRemainingWatchableEpisodes(
      pureUserAnimeList,
      anime,
      animePlatform ? [{ ...animePlatform }] : [],
    ),
  };
}

export function animeResponseWithRelation(
  anime: AnimePrisma & {
    animePlatforms: (AnimePlatformPrisma & {
      platform: PlatformPrisma;
      link: LinkPrisma;
    })[];
    userAnimeList: UserAnimeListPrisma[];
  },
  sortBasedOnUserSelectedPlatform: boolean = true,
): AnimeWithRelation {
  let animePlatforms = [...anime.animePlatforms].map((animePlatform) =>
    animePlatformResponse(animePlatform),
  );

  if (sortBasedOnUserSelectedPlatform) {
    animePlatforms = animePlatforms.sort((a, b) => {
      return animePlatformsBasedOnUserSelectedPlatform(
        a,
        b,
        anime.userAnimeList[0]?.animePlatformId ?? null,
      );
    });
  }

  return {
    ...animeResponse(anime),
    animePlatforms,
    userAnimeList: anime.userAnimeList[0]
      ? userAnimeListResponse({
          ...anime.userAnimeList[0],
          anime: anime,
          animePlatform: anime.animePlatforms[0] ?? null,
        })
      : null,
  };
}

export function animePlatformWithRelation(
  animePlatform: AnimePlatformPrisma & {
    platform: PlatformPrisma;
    link: LinkPrisma;
    anime: AnimePrisma;
  },
): AnimePlatformWithRelation {
  return {
    ...animePlatformResponse(animePlatform),
    anime: animeResponse(animePlatform.anime),
  };
}

export function userAnimeListWithRelation(
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
    ...userAnimeListResponse(userAnimeList),
    anime: animeResponse(userAnimeList.anime),
    animePlatform: userAnimeList.animePlatform
      ? animePlatformResponse(userAnimeList.animePlatform)
      : null,
  };
}
