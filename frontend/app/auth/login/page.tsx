"use client"

import { useForm } from 'react-hook-form';
import { AuthValidation, Login } from '../../../validator/auth.validation';
import { zodResolver } from "@hookform/resolvers/zod"
import InputField from '../../../components/input-field';
import PasswordField from '../../../components/password-field';
import { LogIn } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Button, buttonVariants } from '../../../components/ui/button';
import Link from 'next/link';
import { useAuth } from '../../../providers/auth-provider';
import { Spinner } from '../../../components/ui/spinner';
import ThirdPartyAuth from '../../../components/third-party-auth';
import axios, { HttpStatusCode } from 'axios';
import { ApiValidationError } from '../../../types';
import { toast } from '../../../components/ui/toast';
import AppTitle from '../../../components/app-title';

export default function LoginPage() {
  const form = useForm<Login>({
    resolver: zodResolver(AuthValidation.LOGIN),
    mode: 'onChange',
    defaultValues: {
      identifier: '',
      password: '',
    }
  })

  const { login } = useAuth();

  async function onSubmit(data: Login) {
    try {
      await login(data)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.BadRequest) {
          const zodErrors = error.response.data as ApiValidationError;
          zodErrors.error.forEach((issue) => {
            const field = issue.path[0] as keyof Login;
            form.setError(field, {
              message: issue.message,
            });
          });
          return;
        } else if (error.status === HttpStatusCode.NotFound) {
          form.setValues({
            identifier: '',
            password: '',
          })
          form.setError('identifier', { message: 'Username, email, atau password salah' });
          form.setError('password', { message: 'Username, email, atau password salah' });
          return;
        }
      }
      toast.add({
        type: 'error',
        description: 'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
      })
    }
  }

  return <>
    <AppTitle title='Masuk' subtitle={<>
      Tempat nonton anime makin banyak nih.
      <br />
      Yuk eksplor lagi!
    </>} />

    <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col gap-5'>
      <div className="flex flex-col gap-3 w-full">
        <InputField
          form={form}
          inputName="identifier"
          inputLabel="Username atau email"
          inputPlaceholder="Username atau email"
          className="w-full"
          isRequired
        />
        <PasswordField
          form={form}
          inputName="password"
          inputLabel="Password"
          inputPlaceholder="Password"
          className="w-full"
          isRequired
        />
      </div>

      <Link href={`/auth/forgot-password`} className={cn(buttonVariants({ variant: 'link', size: 'sm', className: 'w-fit self-end' }))}>
        Lupa password?
      </Link>

      <Button type={'submit'} disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Spinner data-icon="inline-start" /> : <LogIn data-icon="inline-start" />} 
        Masuk
      </Button>
    </form>

    <p className='text-sm text-center'>
      Belum punya akun? 
      <Link href={`/auth/register`} className={cn(buttonVariants({ variant: 'link', size: 'sm' }))}>
        Daftar
      </Link>
    </p>

    <ThirdPartyAuth />
  </>
}