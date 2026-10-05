import api from '../lib/axios';
import { ApiResponse } from '../types';
import { User } from '../types/user.model';
import {
  EmailVerification,
  ForgotPassword,
  GetAuthUrl,
  Login,
  Register,
  ResetPassword,
  ThirdPartyLogin,
} from '../validator/auth.validation';

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
    const { data } = await api.post<ApiResponse<true>>(`${prefix}/logout`);
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
    const { data } = await api.post<ApiResponse<{ email: string }>>(
      `${prefix}/resend-verification`,
    );
    return data;
  },

  async forgotPassword(payload: ForgotPassword) {
    const { data } = await api.post<
      ApiResponse<{ email: string; username: string }>
    >(`${prefix}/forgot-password`, payload);
    return data;
  },

  async resetPassword(payload: ResetPassword) {
    const { data } = await api.post<ApiResponse<User>>(
      `${prefix}/reset-password`,
      payload,
    );
    return data;
  },

  async getGoogleAuthUrl(payload: GetAuthUrl) {
    const { data } = await api.get<ApiResponse<{ url: string }>>(
      `${prefix}/google`,
      { params: payload },
    );
    return data;
  },

  async loginWithGoogle(payload: ThirdPartyLogin) {
    const { data } = await api.post<ApiResponse<User>>(
      `${prefix}/google`,
      payload,
    );
    return data;
  },

  async getMalAuthUrl(payload: GetAuthUrl) {
    const { data } = await api.get<ApiResponse<{ url: string }>>(
      `${prefix}/mal`,
      { params: payload },
    );
    return data;
  },

  async loginWithMal(payload: ThirdPartyLogin) {
    const { data } = await api.post<ApiResponse<User>>(
      `${prefix}/mal`,
      payload,
    );
    return data;
  },
};

export default authService;
