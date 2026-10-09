'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ApiResponse } from '../types';
import userService from '../services/user.service';
import authService from '../services/auth.service';
import {
  EmailVerification,
  ForgotPassword,
  Login,
  Register,
  ResetPassword,
  ThirdPartyLogin,
} from '../validator/auth.validation';
import { User } from '../types/user.model';
import { Role } from '../enums';
import { useQueryClient } from '@tanstack/react-query';
import { UpdateUserDetail } from '@/validator/user.validation';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  isAdmin: boolean;
  login: (payload: Login) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: Register) => Promise<void>;
  verifyEmail: (payload: EmailVerification) => Promise<void>;
  resendVerification: () => Promise<ApiResponse<{ email: string }>>;
  forgotPassword: (
    payload: ForgotPassword,
  ) => Promise<ApiResponse<{ email: string; username: string }>>;
  resetPassword: (payload: ResetPassword) => Promise<void>;
  loginWithGoogle: (payload: ThirdPartyLogin) => Promise<void>;
  loginWithMal: (payload: ThirdPartyLogin) => Promise<void>;
  updateUserDetail: (payload: UpdateUserDetail) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;
  const isVerified = user ? user.isVerified : false;
  const isAdmin = user ? user.role === Role.admin : false;

  const queryClient = useQueryClient();

  useEffect(() => {
    async function initializeAuth() {
      try {
        const response = await userService.me();
        setUser(response.data);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, []);

  async function login(payload: Login) {
    try {
      setIsLoading(true);
      const response = await authService.login(payload);
      setUser(response.data);
      queryClient.invalidateQueries({ queryKey: ['anime'] });
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      setIsLoading(true);
      await authService.logout();
    } finally {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ['anime'] });
      setIsLoading(false);
    }
  }

  async function register(payload: Register) {
    setIsLoading(true);
    const response = await authService.register(payload);
    setUser(response.data);
    queryClient.invalidateQueries({ queryKey: ['anime'] });
    setIsLoading(false);
  }

  async function verifyEmail(payload: EmailVerification) {
    setIsLoading(true);
    const response = await authService.verifyEmail(payload);
    setUser(response.data);
    queryClient.invalidateQueries({ queryKey: ['anime'] });
    setIsLoading(false);
  }

  async function resendVerification() {
    return await authService.resendVerification();
  }

  async function forgotPassword(payload: ForgotPassword) {
    return await authService.forgotPassword(payload);
  }

  async function resetPassword(payload: ResetPassword) {
    setIsLoading(true);
    const response = await authService.resetPassword(payload);
    setUser(response.data);
    queryClient.invalidateQueries({ queryKey: ['anime'] });
    setIsLoading(false);
  }

  async function loginWithGoogle(payload: ThirdPartyLogin) {
    try {
      setIsLoading(true);
      const response = await authService.loginWithGoogle(payload);
      setUser(response.data);
      queryClient.invalidateQueries({ queryKey: ['anime'] });
    } finally {
      setIsLoading(false);
    }
  }

  async function loginWithMal(payload: ThirdPartyLogin) {
    try {
      setIsLoading(true);
      const response = await authService.loginWithMal(payload);
      setUser(response.data);
      queryClient.invalidateQueries({ queryKey: ['anime'] });
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUserDetail(payload: UpdateUserDetail) {
    setIsLoading(true);
    const response = await userService.updateUserDetail(payload);
    setUser(response.data);
    queryClient.invalidateQueries({ queryKey: ['anime'] });
    setIsLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isVerified,
        isAdmin,
        login,
        logout,
        register,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        loginWithGoogle,
        loginWithMal,
        updateUserDetail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
