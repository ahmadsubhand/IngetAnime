import { ApiPagination } from '../../types';
import { MalAnime } from '../my-anime-list/my-anime-list.model';
import { AnimeWithRelation } from '../anime/anime.model';

export type AllAnimeWithMal = ApiPagination & {
  anime: (MalAnime & AnimeWithRelation)[];
};

export type AnimeWithSchedule = AnimeWithRelation & {
  schedule: {
    dateTime: string;
    episodeNumber: number;
  };
};

export type AnimeTimeline = {
  dateTime: string;
  anime: AnimeWithSchedule[];
};

export type AnimeDailyTimeline = {
  dateTime: string;
  timelines: AnimeTimeline[];
};
