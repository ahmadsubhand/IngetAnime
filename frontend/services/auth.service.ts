import api from '../lib/axios';
import { ApiResponse, User } from '../types';

const prefix = '/auth';

const authService = {
  async login(payload: {
    identifier: string; 
    password: string;
  }) {
    const { data } = await api.post<ApiResponse<User>>(
      `${prefix}/login`,
      payload,
    );
  
    return data;
  },

  async logout() {
    const { data } = await api.post<ApiResponse<true>>(`${prefix}/logout`,);
    return data;
  }
}

export default authService;