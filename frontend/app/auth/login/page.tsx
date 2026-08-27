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
import Image from 'next/image';
import { useAuth } from '../../../providers/auth-provider';
import { useRouter } from 'next/navigation';
import { Spinner } from '../../../components/ui/spinner';

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
  const router = useRouter();

  async function onSubmit(data: Login) {
    await login(data)
    router.back();
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
          inputPlaceholder="Username"
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

      <Link href={'/auth/forgot-password'} className={cn(buttonVariants({ variant: 'link', size: 'sm', className: 'w-fit self-end' }))}>
        Lupa password?
      </Link>

      <Button type={'submit'} disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Spinner data-icon="inline-start" /> : <LogIn data-icon="inline-start" />} 
        Masuk
      </Button>
    </form>

    <p className='text-sm text-center'>
      Belum punya akun? 
      <Link href={'/auth/register'} className={cn(buttonVariants({ variant: 'link', size: 'sm' }))}>
        Daftar
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