import api from '../lib/axios';
import { ApiResponse } from '../types';
import { AllAnimeWithMal } from '../types/anime-exploration.model';
import { GetAnimeList, GetAnimeRanking } from '../validator/anime-exploration.validation';

const prefix = '/anime';

export const animeExplorationService = {
  async getAnimeList(payload: GetAnimeList) {
    const { data } = await api.get<ApiResponse<AllAnimeWithMal>>(
      `${prefix}`,
      { params: payload }
    );
    return data;
  },

  async getAnimeRanking(payload: GetAnimeRanking) {
    const { data } = await api.get<ApiResponse<AllAnimeWithMal>>(
      `${prefix}/ranking`,
      { params: payload }
    );
    return data;
  },
}

export default animeExplorationService;