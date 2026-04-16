import { ListStatus } from '../../generated/prisma/enums';
import { AnimePlatform } from '../anime-platform/anime-platform.model';
import { Anime } from '../anime/anime.model';

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
  updateAt: string;
  remainingWatchableEpisodes: number | null;
};

export type UserAnimeListWithRelation = UserAnimeList & {
  anime: Anime;
  animePlatform: AnimePlatform | null;
};
