"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { User } from '../types';
import userService from '../services/user.service';
import authService from '../services/auth.service';
import { Role } from '../enums/user.enum';
import { EmailVerification, ForgotPassword, Login, Register, ResetPassword } from '../validator/auth.validation';

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
  resendVerification: () => Promise<void>;
  forgotPassword: (payload: ForgotPassword) => Promise<void>;
  resetPassword: (payload: ResetPassword) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;
  const isVerified = user ? user.isVerified : false;
  const isAdmin = user ? (user.role === Role.admin) : false;

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
    const response = await authService.login(payload);
    setUser(response.data);
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }

  async function register(payload: Register) {
    const response = await authService.register(payload);
    setUser(response.data);
  }

  async function verifyEmail(payload: EmailVerification) {
    const response = await authService.verifyEmail(payload);
    setUser(response.data);
  }

  async function resendVerification() {
    await authService.resendVerification();
  }

  async function forgotPassword(payload: ForgotPassword) {
    await authService.forgotPassword(payload);
  }

  async function resetPassword(payload: ResetPassword) {
    const response = await authService.resetPassword(payload);
    setUser(response.data);
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider",
    );
  }

  return context;
}