import { HttpStatus } from '@nestjs/common';
import { Role } from '../generated/prisma/enums';

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
