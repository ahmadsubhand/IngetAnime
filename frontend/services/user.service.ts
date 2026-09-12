import api from '../lib/axios';
import { ApiResponse } from '../types';
import { User } from '../types/user.model';
import { CheckEmail, CheckUsername } from '../validator/user.validation';

const prefix = '/user';

export const userService = {
  async me() {
    const { data } = await api.get<ApiResponse<User>>(`${prefix}/me`);
    return data;
  },

  async checkUsernameAvailability(payload: CheckUsername) {
    const { data } = await api.get<ApiResponse<{ username: string }>>(
      `${prefix}/check/username`,
      { params: payload }
    );
    return data;
  },

  async checkEmailAvailability(payload: CheckEmail) {
    const { data } = await api.get<ApiResponse<{ email: string }>>(
      `${prefix}/check/email`,
      { params: payload }
    );
    return data;
  },
}

export default userService;