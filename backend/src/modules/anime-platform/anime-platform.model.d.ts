import { AccessType } from '../../generated/prisma/enums';
import { Anime } from '../anime/anime.model';
import { Platform } from '../platform/platform.model';

export type AnimePlatform = {
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
  platform: Platform;
  link: Link;
};

export type Link = {
  id: number;
  url: string;
  platformId: number;
};

export type AnimePlatformWithRelation = AnimePlatform & {
  anime: Anime;
};
