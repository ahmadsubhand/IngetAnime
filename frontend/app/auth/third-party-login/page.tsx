"use client"

import AuthLayout from '../../../components/auth-layout';
import { Spinner } from '../../../components/ui/spinner';

export default function ThirdPartyLoginPage() {
  return <AuthLayout title='Menghubungkan Akun' subtitle={<>
    Tunggu sebentar, kami sedang menghubungkan akun Anda ...
  </>}>
  <div className="w-full flex justify-center">
    <Spinner className='size-8' />
  </div>
  </AuthLayout>
}