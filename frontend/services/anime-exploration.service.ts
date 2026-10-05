import api from '../lib/axios';
import { ApiResponse } from '../types';
import { AllAnimeWithMal } from '../types/anime-exploration.model';
import {
  AnimeSeason,
  GetAnimeList,
  GetAnimeRanking,
  GetSeasonalAnime,
  GetSuggestedAnime,
} from '../validator/anime-exploration.validation';

const prefix = '/anime';

export const animeExplorationService = {
  async getAnimeList(payload: GetAnimeList) {
    const { data } = await api.get<ApiResponse<AllAnimeWithMal>>(`${prefix}`, {
      params: payload,
    });
    return data;
  },

  async getAnimeRanking(payload: GetAnimeRanking) {
    const { data } = await api.get<ApiResponse<AllAnimeWithMal>>(
      `${prefix}/ranking`,
      { params: payload },
    );
    return data;
  },

  async getSeasonalAnime(query: GetSeasonalAnime, param: AnimeSeason) {
    const { data } = await api.get<ApiResponse<AllAnimeWithMal>>(
      `${prefix}/season/${param.year}/${param.season}`,
      { params: query },
    );
    return data;
  },

  async getSuggestedAnime(query: GetSuggestedAnime) {
    const { data } = await api.get<ApiResponse<AllAnimeWithMal>>(
      `${prefix}/suggestions`,
      { params: query },
    );
    return data;
  },
};

export default animeExplorationService;
