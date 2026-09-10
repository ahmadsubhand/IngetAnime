"use client"

import { useForm } from 'react-hook-form';
import AuthLayout from '../../../components/auth-layout';
import { AuthValidation, Register } from '../../../validator/auth.validation';
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

export default function RegisterPage() {
  const form = useForm<Register>({
    resolver: zodResolver(AuthValidation.REGISTER),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  })

  const { register } = useAuth();

  async function onSubmit(data: Register) {
    await register(data)
  }

  return <AuthLayout title='Daftar' subtitle={<>
    Cari tempat nonton anime terbaik?
    <br />
    Yuk eksplor disini!
  </>}>
    <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col gap-5'>
      <div className="flex flex-col gap-3 w-full">
        <InputField
          form={form}
          inputName="username"
          inputLabel="Username"
          inputPlaceholder="Username"
          className="w-full"
          isRequired
        />
        <InputField
          form={form}
          inputName="email"
          inputLabel="Email"
          inputPlaceholder="Email"
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
        <PasswordField
          form={form}
          inputName="confirmPassword"
          inputLabel="Konfirmasi Password"
          inputPlaceholder="Konfirmasi Password"
          className="w-full"
          isRequired
        />
      </div>

      <Button type={'submit'} disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Spinner data-icon="inline-start" /> : <LogIn data-icon="inline-start" />} 
        Daftar
      </Button>
    </form>

    <p className='text-sm text-center'>
      Sudah punya akun? 
      <Link href={`/auth/login`} className={cn(buttonVariants({ variant: 'link', size: 'sm' }))}>
        Masuk
      </Link>
    </p>

    <ThirdPartyAuth />
  </AuthLayout>
}