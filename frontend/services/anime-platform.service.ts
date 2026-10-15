import api from '../lib/axios';
import { ApiResponse } from '../types';
import { CreateOrUpdateAnimePlatform } from '@/validator/anime-platform.validation';
import { AnimePlatform, AnimePlatformWithRelation, Link } from '@/types/anime-platform.model';
import dayjs from 'dayjs';
import { Anime } from '@/types/anime.model';
import { Platform } from '@/types/platform.model';

function getPrefix(animeId: number, platformId: number) {
  return `/anime/${animeId.toString()}/platform/${platformId.toString()}`;
}

export const animePlatformService = {
  async createOrUpdate(
    payload: CreateOrUpdateAnimePlatform,
    animeId: number,
    platformId: number,
  ) {
    if (payload.nextEpisodeAiringAt) {
      payload.nextEpisodeAiringAt = dayjs(
        payload.nextEpisodeAiringAt,
      ).toISOString();
    }
    if (payload.lastEpisodeAiredAt) {
      payload.lastEpisodeAiredAt = dayjs(
        payload.lastEpisodeAiredAt,
      ).toISOString();
    }

    const { data } = await api.patch<ApiResponse<AnimePlatformWithRelation>>(
      `${getPrefix(animeId, platformId)}`,
      payload,
    );
    return data;
  },

  async delete(animeId: number, platformId: number) {
    const { data } = await api.delete<ApiResponse<{
      id: AnimePlatform['id'];
      anime: {
        title: Anime['title'];
      };
      platform: {
        name: Platform['name'];
      };
      link: {
        url: Link['url'];
      };
    }>>(
      `${getPrefix(animeId, platformId)}`,
    );
    return data;
  }
};

export default animePlatformService;
