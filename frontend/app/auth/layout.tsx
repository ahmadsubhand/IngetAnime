"use client"

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../providers/auth-provider';
import { ReactNode, useEffect } from 'react';
import { Spinner } from '../../components/ui/spinner';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isVerified, isLoading } = useAuth();
  const pathname = usePathname();
  const emailVerificationPath = '/auth/email-verification';

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isVerified && (pathname !== emailVerificationPath)) {
      router.replace(emailVerificationPath);
    } else if (!isLoading && isAuthenticated && isVerified) {
      router.replace('/');
    } else if (!isLoading && !isAuthenticated && pathname === emailVerificationPath) {
      router.replace('/auth');
    }
  }, [isLoading, isAuthenticated, isVerified, pathname, router]);

  if (isLoading || isVerified) {
    return (
      <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
          <Spinner className="size-8" />
          <p className="text-lg">
            Mengecek sesi Anda ...
          </p>
      </div>
    );
  }

  return children;
}