'use client';

import { useForm } from 'react-hook-form';
import {
  AuthValidation,
  ForgotPassword,
  ResetPassword,
} from '../../../validator/auth.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Key, Send } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../providers/auth-provider';
import { Spinner } from '../../../components/ui/spinner';
import InputField from '../../../components/input-field';
import { useSearchParams } from 'next/navigation';
import PasswordField from '../../../components/password-field';
import axios, { HttpStatusCode } from 'axios';
import { ApiExpectedError, ApiValidationError } from '../../../types';
import { toast } from '../../../components/ui/toast';
import { useResendCountdown } from '../../../hooks/use-resend-countdown';
import AppTitle from '../../../components/app-title';

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword } = useAuth();

  // Forgot Password
  const formForgotPassword = useForm<ForgotPassword>({
    resolver: zodResolver(AuthValidation.FORGOT_PASSWORD),
    mode: 'onChange',
    defaultValues: {
      identifier: '',
    },
  });

  const { seconds, canResend, start } = useResendCountdown(
    90,
    'canRequestForgotPasswordIn',
  );

  async function onSubmitForgotPassword(data: ForgotPassword) {
    try {
      if (!canResend) return;
      const response = await forgotPassword(data);
      start();
      toast.add({
        type: 'success',
        description: `Tautan reset password telah dikirim ke ${response.data.email}`,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.BadRequest) {
          const zodErrors = error.response.data as ApiValidationError;
          zodErrors.error.forEach((issue) => {
            const field = issue.path[0] as keyof ForgotPassword;
            formForgotPassword.setError(field, {
              message: issue.message,
            });
          });
          return;
        } else if (error.status === HttpStatusCode.NotFound) {
          formForgotPassword.setValues({ identifier: '' });
          formForgotPassword.setError('identifier', {
            message: 'Username atau email tidak ditemukan',
          });
          return;
        } else if (error.status === HttpStatusCode.TooManyRequests) {
          toast.add({
            type: 'error',
            description:
              'Terlalu banyak percobaan. Silakan coba lagi beberapa saat lagi.',
          });
          return;
        }
      }
      toast.add({
        type: 'error',
        description:
          'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
      });
    }
  }

  // Reset Password
  const params = useSearchParams();
  const token = params.get('token');
  const formResetPassword = useForm<ResetPassword>({
    resolver: zodResolver(AuthValidation.RESET_PASSWORD),
    mode: 'onChange',
    defaultValues: {
      token: token || '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmitResetPassword(data: ResetPassword) {
    if (!token) return;
    try {
      await resetPassword(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.BadRequest) {
          const zodErrors = error.response.data as ApiValidationError;
          zodErrors.error.forEach((issue) => {
            const field = issue.path[0] as keyof ResetPassword;
            formResetPassword.setError(field, {
              message: issue.message,
            });
          });
        } else {
          const expectedError = error.response.data as ApiExpectedError;
          toast.add({
            type: 'error',
            description: expectedError.message,
          });
        }
      } else {
        toast.add({
          type: 'error',
          description:
            'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
        });
      }
    }
  }

  return (
    <>
      <AppTitle
        title={token ? 'Reset Password' : 'Lupa Password'}
        subtitle={<>Jangan takut akunmu hilang, kami akan bantu!</>}
      />

      {token ? (
        <form
          onSubmit={formResetPassword.handleSubmit(onSubmitResetPassword)}
          className="w-full flex flex-col gap-5"
        >
          <div className="flex flex-col gap-3 w-full">
            <PasswordField
              form={formResetPassword}
              inputName="newPassword"
              inputLabel="Password baru"
              inputPlaceholder="Password baru"
              className="w-full"
              isDisable={formResetPassword.formState.isSubmitting}
              isRequired
            />
            <PasswordField
              form={formResetPassword}
              inputName="confirmPassword"
              inputLabel="Konfirmasi password"
              inputPlaceholder="Konfirmasi password"
              className="w-full"
              isDisable={formResetPassword.formState.isSubmitting}
              isRequired
            />
          </div>

          <Button
            type={'submit'}
            disabled={formResetPassword.formState.isSubmitting}
          >
            {formResetPassword.formState.isSubmitting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Key data-icon="inline-start" />
            )}
            Reset Password
          </Button>
        </form>
      ) : (
        <form
          onSubmit={formForgotPassword.handleSubmit(onSubmitForgotPassword)}
          className="w-full flex flex-col gap-5"
        >
          <div className="flex flex-col gap-3 w-full">
            <InputField
              form={formForgotPassword}
              inputName="identifier"
              inputLabel="Username atau email"
              inputPlaceholder="Username atau email"
              className="w-full"
              isDisable={formForgotPassword.formState.isSubmitting}
              isRequired
            />
          </div>

          <Button
            type={'submit'}
            disabled={!canResend || formForgotPassword.formState.isSubmitting}
          >
            {formForgotPassword.formState.isSubmitting ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Send data-icon="inline-start" />
            )}
            Kirim tautan {!canResend ? ` ulang dalam ${seconds} detik` : ''}
          </Button>
        </form>
      )}
    </>
  );
}
