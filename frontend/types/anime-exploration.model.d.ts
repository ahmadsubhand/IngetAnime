import { MalAnime } from './my-anime-list.model';
import { ApiPagination } from '.';
import { AnimeWithRelation } from './anime.model';

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
