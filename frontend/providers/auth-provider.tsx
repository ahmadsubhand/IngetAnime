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

interface LoginPayload {
  identifier: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  const isAuthenticated = user !== null;

  useEffect(() => {
    async function initializeAuth() {
      try {
        const response = await userService.me();

        setUser(response.data);
        setIsVerified(response.data.isVerified);
      } catch {
        setUser(null);
        setIsVerified(false);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, []);

  async function login(payload: LoginPayload) {
    const response = await authService.login(payload);

    setUser(response.data);
    setIsVerified(response.data.isVerified);
  }

  async function logout() {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsVerified(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isVerified,
        login,
        logout,
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