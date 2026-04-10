import { HttpStatus } from '@nestjs/common';
import {
  AccessType,
  Role,
  AnimeStatus,
  ListStatus,
} from '../generated/prisma/enums';
import { AnimeNode } from './mal';

export interface ApiResponse<T> {
  message: string;
  data: T;
  statusCode: HttpStatus;
}

export interface UserResponse {
  id: number;
  username: string;
  picture: string | null;
  role: Role;
  email: string | null;
  isVerified: boolean;
}

export interface AnimeResponse {
  id: number;
  malId: number;
  updateAt: string;
  picture: string;
  title: string;
  titleEN: string | null;
  titleID: string | null;
  releaseAt: string | null;
  episodeTotal: number;
  status: AnimeStatus;
}

export interface AnimeFullRelation {
  animePlatforms: (AnimePlatformResponse & {
    platform: PlatformResponse;
    link: LinkResponse;
  })[];
  userAnimeList: UserAnimeListResponse | null;
}

export interface AnimePlatformResponse {
  id: number;
  animeId: number;
  platformId: number;
  accessType: AccessType;
  nextEpisodeAiringAt: string | null;
  lastEpisodeAiredAt: string | null;
  intervalInDays: number;
  episodeAired: number;
  isMainPlatform: boolean;
  isHiatus: boolean;
}

export interface AnimePlatformShortRelation {
  platform: {
    name: PlatformResponse['name'];
  };
  anime: {
    title: AnimeResponse['title'];
  };
  link: {
    url: LinkResponse['url'];
  };
}

export interface AnimePlatformFullRelation {
  platform: PlatformResponse;
  anime: AnimeResponse;
  link: LinkResponse;
}

export interface PlatformResponse {
  id: number;
  name: string;
}

export interface LinkResponse {
  id: number;
  url: string;
  platformId: number;
}

export interface UserAnimeListResponse {
  id: number;
  userId: number;
  animeId: number;
  animePlatformId: number | null;
  startDate: string | null;
  finishDate: string | null;
  progress: number;
  score: number;
  episodesDifference: number;
  status: ListStatus;
  isSyncedWithMal: boolean;
  updateAt: string;
}

interface UserAnimeListShortRelation {
  anime: {
    title: AnimeResponse['title'];
  };
  animePlatform: {
    link: { url: LinkResponse['url'] };
    platform: { name: PlatformResponse['name'] };
  } | null;
}

interface UserAnimeListFullRelation {
  anime: AnimeResponse;
  animePlatform:
    | ({
        link: LinkResponse;
        platform: PlatformResponse;
      } & AnimePlatformResponse)
    | null;
}

interface AnimeListResponse {
  anime: (AnimeNode & AnimeResponse & AnimeFullRelation)[];
  paging?: {
    prev?: string;
    next?: string;
  };
}

interface UserFullResponse {
  id: number;
  email: string | null;
  username: string;
  picture: string | null;
  isVerified: boolean;
  role: Role;
  malId: number | null;
  googleId: number | null;
  updatedAt: string;
  createdAt: string;
}

export type UserAnimeListComputed = (UserAnimeListResponse & {
  anime: AnimeResponse & {
    animePlatforms: (AnimePlatformResponse & {
      platform: PlatformResponse;
      link: LinkResponse;
    })[];
  };
  remainingWatchableEpisodes: number;
})[];

interface UserAnimeListComputedResponse {
  userAnimeList: UserAnimeListComputed;
  paging?: {
    prev?: string;
    next?: string;
  };
}
