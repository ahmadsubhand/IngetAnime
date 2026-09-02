"use client"

import { useForm } from 'react-hook-form';
import AuthLayout from '../../../components/auth-layout';
import { AuthValidation, EmailVerification } from '../../../validator/auth.validation';
import { zodResolver } from "@hookform/resolvers/zod"
import { BadgeCheck } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../providers/auth-provider';
import { Spinner } from '../../../components/ui/spinner';
import OtpField from '../../../components/otp-field';
import { useResendCountdown } from '../../../hooks/use-resend-countdown';
import { useState } from 'react';

export default function EmailVerificationPage() {
  const form = useForm<EmailVerification>({
    resolver: zodResolver(AuthValidation.EMAIL_VERIFICATION),
    mode: 'onChange',
    defaultValues: {
      otpCode: '',
    }
  })
  const { verifyEmail, resendVerification } = useAuth();
  async function onSubmit(data: EmailVerification) {
    await verifyEmail(data)
  }

  const { seconds, canResend, start } = useResendCountdown(90);
  const [isLoading, setIsLoading] = useState(false);
  async function resend() {
    setIsLoading(true);
    if (!canResend) return;
    await resendVerification();
    start();
    setIsLoading(false);
  }

  return <AuthLayout title='Verifikasi Email' subtitle={<>
    Verifikasi akunmu untuk menikmati lebih banyak fitur!
  </>}>
    <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col gap-5'>
      <div className="flex flex-col gap-3 w-fit self-center">
        <OtpField
          form={form}
          inputName="otpCode"
          inputLabel="Kode OTP"
          isRequired
        />
      </div>

      <p className='text-sm text-center'>
        Belum menerima tautan verifikasi? 
        <Button variant={'link'} onClick={resend} disabled={!canResend || isLoading || form.formState.isSubmitting}>
          Kirim tautan {!canResend ? ` ulang dalam ${seconds} detik` : ''}
        </Button>
      </p>

      <Button type={'submit'} disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Spinner data-icon="inline-start" /> : <BadgeCheck data-icon="inline-start" />} 
        Verifikasi
      </Button>
    </form>
  </AuthLayout>
}