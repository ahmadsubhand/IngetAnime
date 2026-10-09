'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Spinner } from '../../../components/ui/spinner';
import { useAuth } from '../../../providers/auth-provider';
import { useEffect } from 'react';
import AppTitle from '../../../components/app-title';

export default function ThirdPartyLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const state = params.get('state');
  const iss = params.get('iss');
  const code = params.get('code');
  const error = params.get('error');

  const { loginWithGoogle, loginWithMal, isLoading } = useAuth();

  useEffect(() => {
    async function handleLogin() {
      if (state && code && !isLoading) {
        if (iss === 'https://accounts.google.com') {
          await loginWithGoogle({ state, code });
        } else {
          await loginWithMal({ state, code });
        }
      } else if (error === 'access_denied' || error) {
        router.replace('/auth');
      }
    }

    void handleLogin();
  }, [
    code,
    error,
    isLoading,
    iss,
    loginWithGoogle,
    loginWithMal,
    router,
    state,
  ]);

  return (
    <>
      <AppTitle
        title="Menghubungkan Akun"
        subtitle={<>Tunggu sebentar, kami sedang menghubungkan akun Anda ...</>}
      />
      <div className="w-full flex justify-center">
        <Spinner className="size-8" />
      </div>
    </>
  );
}
