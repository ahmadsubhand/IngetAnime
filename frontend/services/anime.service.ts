import { UpdateAnime } from '@/validator/anime.validation';
import api from '../lib/axios';
import { ApiResponse } from '../types';
import { Anime } from '../types/anime.model';

const prefix = '/anime';

export const animeService = {
  async update(payload: UpdateAnime, id: number) {
    const { data } = await api.patch<ApiResponse<Anime>>(
      `${prefix}/${id}`,
      payload,
    );
    return data;
  },
};

export default animeService;
