import api from '../lib/axios';
import { ApiResponse } from '../types';
import { AllAnime, User } from '../types/user.model';
import { CheckEmail, CheckUsername, GetUserAnimeList, ImportAnimeListFromMal, UpdateUserDetail } from '../validator/user.validation';

const prefix = '/user';

export const userService = {
  async me() {
    const { data } = await api.get<ApiResponse<User>>(`${prefix}/me`);
    return data;
  },

  async checkUsernameAvailability(payload: CheckUsername) {
    const { data } = await api.get<ApiResponse<{ username: string }>>(
      `${prefix}/check/username`,
      { params: payload },
    );
    return data;
  },

  async checkEmailAvailability(payload: CheckEmail) {
    const { data } = await api.get<ApiResponse<{ email: string }>>(
      `${prefix}/check/email`,
      { params: payload },
    );
    return data;
  },

  async getUserAnimeList(payload: GetUserAnimeList) {
    const { data } = await api.get<ApiResponse<AllAnime>>(
      `${prefix}/me/my-list-status`,
      { params: payload },
    );
    return data;
  },

  async updateUserDetail(payload: UpdateUserDetail) {
    const { data } = await api.put<ApiResponse<User>>(
      `${prefix}/me`,
      payload,
    );
    return data;
  },

  async importAnimeListFromMal(payload: ImportAnimeListFromMal) {
    const { data } = await api.post<ApiResponse<{ count: number }>>(
      `${prefix}/me/import-from-mal`,
      payload,
    );
    return data;
  },
};

export default userService;
