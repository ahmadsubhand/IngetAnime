import { Platform } from '@/types/platform.model';
import api from '@/lib/axios';
import { ApiResponse } from '@/types';

const prefix = '/platform';

export const platformService = {
  async getAllPlatform() {
    const { data } = await api.get<ApiResponse<Platform[]>>(`${prefix}`);
    return data;
  },
};

export default platformService;
