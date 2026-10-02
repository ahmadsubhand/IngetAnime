"use client"

import { useForm } from 'react-hook-form';
import { AuthValidation, EmailVerification } from '../../../validator/auth.validation';
import { zodResolver } from "@hookform/resolvers/zod"
import { BadgeCheck } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../providers/auth-provider';
import { Spinner } from '../../../components/ui/spinner';
import OtpField from '../../../components/otp-field';
import { useResendCountdown } from '../../../hooks/use-resend-countdown';
import { useState } from 'react';
import axios, { HttpStatusCode } from 'axios';
import { ApiValidationError } from '../../../types';
import { toast } from '../../../components/ui/toast';
import AppTitle from '../../../components/app-title';

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
    try {
      await verifyEmail(data)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.BadRequest) {
          const zodErrors = error.response.data as ApiValidationError;
          zodErrors.error.forEach((issue) => {
            const field = issue.path[0] as keyof EmailVerification;
            form.setError(field, {
              message: issue.message,
            });
          });
          return;
        } else if (error.status === HttpStatusCode.NotFound) {
          form.setValues({
            otpCode: '',
          })
          form.setError('otpCode', { message: 'Kode OTP salah' });
          return;
        } else if (error.status === HttpStatusCode.Gone) {
          form.setValues({
            otpCode: '',
          })
          form.setError('otpCode', { message: 'Kode OTP sudah kedaluwarsa' });
          return;
        }
      }
      toast.add({
        type: 'error',
        description: 'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
      })
    }
  }

  const { seconds, canResend, start } = useResendCountdown(90);
  const [isLoading, setIsLoading] = useState(false);
  const isDisable = form.formState.isSubmitting || isLoading;
  async function resend() {
    try {
      setIsLoading(true);
      if (!canResend) return;
      const response = await resendVerification();
      start();
      toast.add({
        type: 'success',
        description: `Tautan verifikasi akun telah dikirim ke ${response.data.email}`,
      })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.TooManyRequests) {
          toast.add({
            type: 'error',
            description: 'Terlalu banyak percobaan. Silakan coba lagi beberapa saat lagi.',
          })
          return;
        }
      }
      toast.add({
        type: 'error',
        description: 'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
      })
    } finally {
      setIsLoading(false);
    }
  }

  return <>
    <AppTitle title='Verifikasi Email' subtitle={<>
      Verifikasi akunmu untuk menikmati lebih banyak fitur!
    </>} />

    <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col gap-5'>
      <div className="flex flex-col gap-3 w-fit self-center">
        <OtpField
          form={form}
          inputName="otpCode"
          inputLabel="Kode OTP"
          isDisable={isDisable}
          isRequired
        />
      </div>

      <p className='text-sm text-center'>
        Belum menerima tautan verifikasi?
        <Button variant={'link'} onClick={resend} disabled={!canResend || isDisable}>
          Kirim tautan {!canResend ? ` ulang dalam ${seconds} detik` : ''}
        </Button>
      </p>

      <Button type={'submit'} disabled={isDisable}>
        {form.formState.isSubmitting ? <Spinner data-icon="inline-start" /> : <BadgeCheck data-icon="inline-start" />} 
        Verifikasi
      </Button>
    </form>
  </>
}