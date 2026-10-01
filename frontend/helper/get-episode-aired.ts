import { AnimeStatus } from '../enums';

export default function getEpisodeAired(
  status: AnimeStatus,
  episodeTotal: number,
  firstAnimePlatform?: { episodeAired: number } | null,
) {
  return firstAnimePlatform?.episodeAired ?? 
    (status === 'finished_airing' ? episodeTotal : null);
}