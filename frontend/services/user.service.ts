import api from '../lib/axios';
import { ApiResponse, User } from '../types';

const prefix = '/user';

export const userService = {
  async me() {
    const { data } = await api.get<ApiResponse<User>>(`${prefix}/me`);
    return data;
  }
}

export default userService;