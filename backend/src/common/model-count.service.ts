import { Injectable } from '@nestjs/common';
import { AnimeStatus } from '../generated/prisma/enums';

type UserAnimeList = {
  episodesDifference: number;
  progress: number;
  animePlatformId: number | null;
};

type Anime = {
  status: AnimeStatus;
  episodeTotal: number;
};

type AnimePlatform = {
  id: number;
  episodeAired: number;
};

@Injectable()
export class ModelCountService {
  countRemainingWatchableEpisodes(
    userAnimeList: UserAnimeList,
    anime: Anime,
    animePlatforms: AnimePlatform[],
  ): number | null {
    const episodeAired =
      animePlatforms[0] &&
      animePlatforms[0].id === userAnimeList.animePlatformId
        ? animePlatforms[0].episodeAired
        : anime.status === 'finished_airing'
          ? anime.episodeTotal
          : -1;
    if (episodeAired === -1) return null;
    return (
      episodeAired - userAnimeList.episodesDifference - userAnimeList.progress
    );
    // const episodeAired = animePlatforms[0] || animePlatforms[0].ep
    //   ? userAnimeList.anime.animePlatforms[0].episodeAired
    //   : userAnimeList.anime.status === 'finished_airing'
    //     ? userAnimeList.anime.episodeTotal
    //     : -1;
  }
}
