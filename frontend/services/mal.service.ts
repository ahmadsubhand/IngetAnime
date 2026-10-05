import api from '../lib/axios';
import { ApiResponse } from '../types';
import { MalAnime } from '../types/my-anime-list.model';
import { Fields } from '../validator/my-anime-list.validation';

function getPrefix(malId: number) {
  return `/mal/anime/${malId.toString()}`;
}

export const malService = {
  async detail(payload: Fields, malId: number) {
    const { data } = await api.get<ApiResponse<MalAnime>>(
      `${getPrefix(malId)}`,
      { params: payload },
    );
    return data;
  },
};

export default malService;
