import { HttpStatus } from '@nestjs/common';
import {
  AccessType,
  Role,
  AnimeStatus,
  ListStatus,
} from '../generated/prisma/enums';

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
  platform: {
    link: { url: LinkResponse['url'] };
    platform: { name: PlatformResponse['name'] };
  } | null;
}

interface UserAnimeListFullRelation {
  anime: AnimeResponse;
  platform:
    | ({
        link: LinkResponse;
        platform: PlatformResponse;
      } & AnimePlatformResponse)
    | null;
}
