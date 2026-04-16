import { AnimeStatus } from '../../generated/prisma/enums';
import { AnimePlatform } from '../anime-platform/anime-platform.model';
import { UserAnimeList } from '../user-anime-list/user-anime-list.model';

export type Anime = {
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
};

export type AnimeWithRelation = Anime & {
  animePlatforms: AnimePlatform[];
  userAnimeList: UserAnimeList | null;
};
