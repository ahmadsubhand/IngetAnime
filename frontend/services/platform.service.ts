import { Platform } from '@/types/platform.model';
import api from '@/lib/axios';
import { ApiResponse } from '@/types';
import { PlatformName } from '@/validator/platform.validation';

const prefix = '/platform';

export const platformService = {
  async getAllPlatform() {
    const { data } = await api.get<ApiResponse<(Platform & { _count: { animePlatforms: number } })[]>>(`${prefix}`);
    return data;
  },

  async updatePlatform(payload: PlatformName, id: number, icon?: File) {
    const formData = new FormData();
    formData.append('name', payload.name);
    if (icon) {
      formData.append('icon', icon);
    }

    const { data } = await api.put<ApiResponse<Platform>>(
      `${prefix}/${id}`,
      formData,
    );
    return data;
  },

  async createPlatform(payload: PlatformName, icon?: File) {
    const formData = new FormData();
    formData.append('name', payload.name);
    if (icon) {
      formData.append('icon', icon);
    }

    const { data } = await api.post<ApiResponse<Platform>>(
      `${prefix}`,
      formData,
    );
    return data;
  },
};

export default platformService;
