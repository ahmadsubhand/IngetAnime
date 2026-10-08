'use client';

import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Platform } from '@/types/platform.model';
import platformService from '@/services/platform.service';

interface PlatformContextValue {
  platforms:
    | (Platform & {
        _count: {
          animePlatforms: number;
        };
      })[]
    | undefined;
  isFetching: boolean;
  isRefetching: boolean;
  status: 'error' | 'pending' | 'success'
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const { data: platforms, isFetching, isRefetching, status } = useQuery({
    queryKey: ['anime', 'platform'],
    queryFn: async () => {
      const response = await platformService.getAllPlatform();
      return response.data;
    },
    staleTime: Infinity,
  });

  return (
    <PlatformContext.Provider
      value={{
        platforms,
        isFetching,
        isRefetching,
        status,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatforms() {
  const context = useContext(PlatformContext);

  if (!context) {
    throw new Error('usePlatforms must be used within an PlatformProvider');
  }

  return context;
}
