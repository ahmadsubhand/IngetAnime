import { HttpStatus } from '@nestjs/common';
import {
  AccessType,
  Role,
  AnimeStatus,
  ListStatus,
} from '../generated/prisma/enums';
import { GetAuthUrl } from '../auth/auth.validation';

export interface JwtPayload {
  sub: number;
  type: 'access_token' | 'reset_password';
}

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

// Google Auth Types

interface StateObject {
  mode: GetAuthUrl['mode'];
  state: string;
}

interface GoogleError {
  error: string;
  error_description?: string;
}

// MAL Auth Types

interface MalToken {
  token_type: 'Bearer';
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface MalProfile {
  id: number;
  name: string;
  gender?: 'male' | 'female';
  birthday: string;
  location: string;
  joined_at: string;
  picture?: string;
}

interface MalError {
  error: string;
  message?: string;
  hint?: string;
}

// MAL Anime

interface Picture {
  medium: string;
  large: string;
}

interface Genre {
  id: number;
  name: string;
}

interface Studio {
  id: number;
  name: string;
}

interface AlternativeTitles {
  synonyms: string[];
  en?: string;
  ja?: string;
}

interface StartSeason {
  year: number;
  season: 'winter' | 'spring' | 'summer' | 'fall';
}

interface Broadcast {
  day_of_the_week: string;
  start_time: string;
}

interface MyListStatus {
  status: 'watching' | 'completed' | 'on_hold' | 'dropped' | 'plan_to_watch';
  score: number;
  num_episodes_watched: number;
  is_rewatching: boolean;
  updated_at: string;
}

interface AnimeNode {
  id: number;
  title: string;
  main_picture: {
    medium: string;
    large: string;
  };
  alternative_titles?: AlternativeTitles;
  start_date?: string;
  end_date?: string;
  synopsis?: string;
  mean?: number;
  rank?: number;
  popularity?: number;
  num_list_users?: number;
  num_scoring_users?: number;
  nsfw?: 'white' | 'gray' | 'black';
  created_at?: string;
  updated_at?: string;
  media_type?: 'tv' | 'movie' | 'ova' | 'ona' | 'special';
  status?: 'finished_airing' | 'currently_airing' | 'not_yet_aired';
  genres?: Genre[];
  my_list_status?: MyListStatus;
  num_episodes?: number;
  start_season?: StartSeason;
  broadcast?: Broadcast;
  source?: string;
  average_episode_duration?: number;
  rating?: string;
  pictures?: Picture[];
  background?: string;
  related_anime?: RelatedAnime[];
  related_manga?: unknown[]; // MAL returns empty array here
  recommendations?: Recommendation[];
  studios?: Studio[];
  statistics?: AnimeStatistics;
}

interface MalListAnime {
  data: {
    node: AnimeNode;
  }[];
  paging?: {
    prev?: string;
    next?: string;
  };
}

interface AnimeList {
  anime: AnimeNode[];
  paging?: {
    prev?: string;
    next?: string;
  };
}

interface MalStatusRequest {
  status?: ListStatus;
  num_watched_episodes?: number;
  score?: number;
  start_date?: string | null;
  finish_date?: string | null;
}

interface MalStatusResponse {
  status: ListStatus;
  score: number;
  num_episodes_watched: number;
  is_rewatching: boolean;
  updated_at: string;
  start_date?: string;
  finish_date?: string;
  // priority: 0;
  // num_times_rewatched: 0;
  // rewatch_value: 0;
  // tags: [];
  // comments: '';
}
