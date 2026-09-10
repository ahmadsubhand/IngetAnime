"use client"

import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '../../../components/auth-layout';
import { Spinner } from '../../../components/ui/spinner';
import { useAuth } from '../../../providers/auth-provider';
import { useEffect } from 'react';

export default function ThirdPartyLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const state = params.get('state');
  const iss = params.get('iss');
  const code = params.get('code');
  const error = params.get('error');

  const { loginWithGoogle, loginWithMal } = useAuth();

  useEffect(() => {
    if (state && code) {
      if (iss === 'https://accounts.google.com') {
        loginWithGoogle({ state, code })
      } else {
        loginWithMal({ state, code })
      }
    } else if (error === 'access_denied' || error) {
      router.push('/auth');
    }
  }, [state, code, iss, loginWithGoogle, loginWithMal, error, router]);

  return <AuthLayout title='Menghubungkan Akun' subtitle={<>
    Tunggu sebentar, kami sedang menghubungkan akun Anda ...
  </>}>
    <div className="w-full flex justify-center">
      <Spinner className='size-8' />
    </div>
  </AuthLayout>
}