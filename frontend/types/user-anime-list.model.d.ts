import { ListStatus } from '../enums';
import { AnimePlatform } from './anime-platform.model';
import { Anime } from './anime.model';

export type UserAnimeList = {
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
  updatedAt: string;
  remainingWatchableEpisodes: number | null;
};

export type UserAnimeListWithRelation = UserAnimeList & {
  anime: Anime;
  animePlatform: AnimePlatform | null;
};
