"use client"

import { useForm, useWatch } from 'react-hook-form';
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
import axios, { HttpStatusCode } from 'axios';
import { ApiValidationError } from '../../../types';
import { toast } from '../../../components/ui/toast';
import { useEffect, useState } from 'react';
import userService from '../../../services/user.service';

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
    try {
      await register(data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.BadRequest) {
          const zodErrors = error.response.data as ApiValidationError;
          zodErrors.error.forEach((issue) => {
            const field = issue.path[0] as keyof Register;
            form.setError(field, {
              message: issue.message,
            });
          });
          return;
        } else if (error.status === HttpStatusCode.Conflict) {
          form.setValues({
            username: '',
            email: '',
          })
          form.setError('username', { message: 'Username atau email sudah digunakan' });
          form.setError('email', { message: 'Username atau email sudah digunakan' });
          return;
        }
      }
      toast.add({
        type: 'error',
        description: 'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
      })
    }
  }
  
  const usernameVal = useWatch({
    control: form.control,
    name: 'username',
  });
  const [usernameMessage, setUsernameMessage] = useState('');
  
  useEffect(() => {
    const delayDebounceFn = setTimeout( async () => {
      if (form.formState.errors.username || !usernameVal) {
        setUsernameMessage('');
        return;
      }
      setUsernameMessage('Mengecek ...');
      try {
        await userService.checkUsernameAvailability({ username: usernameVal });
        setUsernameMessage(`"${usernameVal}" tersedia`);
      } catch (error) {
        setUsernameMessage('');
        if (axios.isAxiosError(error) && error.response?.data) {
          if (error.status === HttpStatusCode.Conflict) {
            form.setError('username', { message: `"${usernameVal}" sudah digunakan` });
            return;
          }
        }
      }
    }, 1000)

    return () => clearTimeout(delayDebounceFn);
  }, [usernameVal, form]);

  const emailVal = useWatch({
    control: form.control,
    name: 'email',
  });
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => { 
    const delayDebounceFn = setTimeout( async () => {
      if (form.formState.errors.email || !emailVal) {
        setEmailMessage('');
        return;
      };
      setEmailMessage('Mengecek ...');

      try {
        await userService.checkEmailAvailability({ email: emailVal });
        setEmailMessage(`"${emailVal}" tersedia`);
      } catch (error) {
        setEmailMessage('');
        if (axios.isAxiosError(error) && error.response?.data) {
          if (error.status === HttpStatusCode.Conflict) {
            form.setError('email', { message: `"${emailVal}" sudah digunakan` });
            return;
          }
        }
      }
    }, 1000)

    return () => clearTimeout(delayDebounceFn);
  }, [emailVal, form]);

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
          inputDescription={usernameMessage}
          inputPlaceholder="Username"
          className="w-full"
          isRequired
        />
        <InputField
          form={form}
          inputName="email"
          inputLabel="Email"
          inputDescription={emailMessage}
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