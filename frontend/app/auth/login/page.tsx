"use client"

import { useForm } from 'react-hook-form';
import AuthLayout from '../../../components/auth-layout';
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
    await login(data)
  }

  return <AuthLayout title='Masuk' subtitle={<>
    Tempat nonton anime makin banyak nih.
    <br />
    Yuk eksplor lagi!
  </>}>
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
  </AuthLayout>
}