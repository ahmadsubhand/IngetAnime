'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../providers/auth-provider';
import { ReactNode, useEffect } from 'react';
import { Spinner } from '../../components/ui/spinner';
import Image from 'next/image';
import AppHeader from '@/components/app-header';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isVerified, isLoading } = useAuth();
  const pathname = usePathname();
  const emailVerificationPath = '/auth/email-verification';

  useEffect(() => {
    if (
      !isLoading &&
      isAuthenticated &&
      !isVerified &&
      pathname !== emailVerificationPath
    ) {
      router.replace(emailVerificationPath);
    } else if (!isLoading && isAuthenticated && isVerified) {
      router.replace('/');
    } else if (
      !isLoading &&
      !isAuthenticated &&
      pathname === emailVerificationPath
    ) {
      router.replace('/auth');
    }
  }, [isLoading, isAuthenticated, isVerified, pathname, router]);

  return (
    <div className='w-full min-h-svh flex flex-col'>
      <AppHeader className='sticky top-0 left-0' />

      {(isLoading || isVerified) ? (
        <main className="flex-1 flex flex-col gap-2 items-center justify-center">
          <Spinner className="size-8" />
          <p className="text-lg">Mengecek sesi Anda ...</p>
        </main>
      ) : (
        <div className="flex-1 flex">
          <div className="w-full md:w-1/2 xl:justify-end h-full flex items-center justify-center">
            <main className="w-full flex flex-col justify-center gap-5 sm:px-10 px-5 py-3 md:w-105 xl:mr-30">
              {children}
            </main>
          </div>
          <div className="relative hidden md:block w-1/2">
            <Image
              src={'/auth-bg.jpg'}
              alt="Auth Background - Kaguya Shinomiya"
              className="object-cover"
              fill
              sizes="(max-width: 767px) 0px, 50vw"
              loading={'eager'}
            />
            <div className="w-full h-full absolute z-1 bg-linear-to-r from-white to-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
}
