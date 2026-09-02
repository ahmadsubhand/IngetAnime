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
import Image from 'next/image';
import { useAuth } from '../../../providers/auth-provider';
import { Spinner } from '../../../components/ui/spinner';

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

    <div className="flex gap-5 w-full">
      <Button variant={'outline'} className={'flex-1'}>
        <Image src={'/google.png'} alt='google logo' width={16} height={16} />
        Google
      </Button>
      <Button variant={'ghost'} className={`flex-1 bg-app-blue hover:text-white hover:bg-app-blue text-white [&_svg:not([class*='size-'])]:size-6`}>
        <Image src={'/mal.png'} alt='google logo' width={24} height={24} />
        MyAnimeList
      </Button>
    </div>
  </AuthLayout>
}