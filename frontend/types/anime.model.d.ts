import { AnimeStatus } from '../enums';
import { AnimePlatform } from './anime-platform.model';
import { UserAnimeList } from './user-anime-list.model';

export type Anime = {
  id: number;
  malId: number;
  updatedAt: string;
  picture: string;
  title: string;
  titleEN: string | null;
  titleID: string | null;
  releaseAt: string | null;
  episodeTotal: number;
  status: AnimeStatus;
};

export type AnimeWithRelation = Anime & {
  animePlatforms: AnimePlatform[];
  userAnimeList: UserAnimeList | null;
};
