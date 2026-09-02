import api from '../lib/axios';
import { ApiResponse, User } from '../types';
import { EmailVerification, ForgotPassword, Login, Register, ResetPassword } from '../validator/auth.validation';

const prefix = '/auth';

const authService = {
  async login(payload: Login) {
    const { data } = await api.post<ApiResponse<User>>(
      `${prefix}/login`,
      payload,
    );
    return data;
  },

  async logout() {
    const { data } = await api.post<ApiResponse<true>>(
      `${prefix}/logout`
    );
    return data;
  },

  async register(payload: Register) {
    const { data } = await api.post<ApiResponse<User>>(
      `${prefix}/register`,
      payload,
    );
    return data;
  },

  async verifyEmail(payload: EmailVerification) {
    const { data } = await api.post<ApiResponse<User>>(
      `${prefix}/verify-email`,
      payload,
    );
    return data;
  },

  async resendVerification() {
    const { data } = await api.post<ApiResponse<{ email: string; }>>(
      `${prefix}/resend-verification`
    );
    return data;
  },

  async forgotPassword(payload: ForgotPassword) {
    const { data } =  await api.post<ApiResponse<{ email: string; username: string }>>(
      `${prefix}/forgot-password`,
      payload,
    );
    return data;
  },

  async resetPassword(payload: ResetPassword) {
    const { data } =  await api.post<ApiResponse<User>>(
      `${prefix}/reset-password`,
      payload,
    );
    return data;
  },
}

export default authService;