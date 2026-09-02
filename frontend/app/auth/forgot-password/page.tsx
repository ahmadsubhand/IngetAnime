"use client"

import { useForm } from 'react-hook-form';
import AuthLayout from '../../../components/auth-layout';
import { AuthValidation, ForgotPassword, ResetPassword } from '../../../validator/auth.validation';
import { zodResolver } from "@hookform/resolvers/zod"
import { Key, Send } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../providers/auth-provider';
import { Spinner } from '../../../components/ui/spinner';
import InputField from '../../../components/input-field';
import { useSearchParams } from 'next/navigation';
import PasswordField from '../../../components/password-field';

export default function ForgotPasswordPage() {
  const { forgotPassword, resetPassword } = useAuth();

  // Forgot Password
  const formForgotPassword = useForm<ForgotPassword>({
    resolver: zodResolver(AuthValidation.FORGOT_PASSWORD),
    mode: 'onChange',
    defaultValues: {
      identifier: '',
    }
  });
  async function onSubmitForgotPassword(data: ForgotPassword) {
    await forgotPassword(data);
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
    }
  })
  async function onSubmitResetPassword(data: ResetPassword) {
    if (!token) return;
    await resetPassword(data)
  }

  return <AuthLayout title={token ? 'Reset Password' : 'Lupa Password'} subtitle={<>
    Jangan takut akunmu hilang, kami akan bantu!
  </>}>
    {token ? (
      <form onSubmit={formResetPassword.handleSubmit(onSubmitResetPassword)} className='w-full flex flex-col gap-5'>
        <div className="flex flex-col gap-3 w-full">
          <PasswordField
            form={formResetPassword}
            inputName="newPassword"
            inputLabel="Password baru"
            inputPlaceholder="Password baru"
            className="w-full"
            isRequired
          />
          <PasswordField
            form={formResetPassword}
            inputName="confirmPassword"
            inputLabel="Konfirmasi password"
            inputPlaceholder="Konfirmasi password"
            className="w-full"
            isRequired
          />
        </div>

        <Button type={'submit'} disabled={formResetPassword.formState.isSubmitting}>
          {formResetPassword.formState.isSubmitting ? <Spinner data-icon="inline-start" /> : <Key data-icon="inline-start" />} 
          Reset Password
        </Button>
      </form>
    ) : (
      <form onSubmit={formForgotPassword.handleSubmit(onSubmitForgotPassword)} className='w-full flex flex-col gap-5'>
        <div className="flex flex-col gap-3 w-full">
          <InputField
            form={formForgotPassword}
            inputName="identifier"
            inputLabel="Username atau email"
            inputPlaceholder="Username atau email"
            className="w-full"
            isRequired
          />
        </div>

        <Button type={'submit'} disabled={formForgotPassword.formState.isSubmitting}>
          {formForgotPassword.formState.isSubmitting ? <Spinner data-icon="inline-start" /> : <Send data-icon="inline-start" />} 
          Kirim Tautan
        </Button>
      </form>
    )}
  </AuthLayout>
}