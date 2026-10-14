'use client';

import AppTitle from '@/components/app-title';
import InputField from '@/components/input-field';
import SelectField from '@/components/select-field';
import SwitchField from '@/components/switch-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import { useAuth } from '@/providers/auth-provider';
import authService from '@/services/auth.service';
import userService from '@/services/user.service';
import { ApiExpectedError, ApiValidationError } from '@/types';
import { User } from '@/types/user.model';
import { ThirdPartyLogin } from '@/validator/auth.validation';
import {
  ImportAnimeListFromMal,
  UpdateUserDetail,
  UserValidation,
} from '@/validator/user.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { HttpStatusCode } from 'axios';
import { Check, Plus } from 'lucide-react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import Image from 'next/image';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

export default function SettingsPage() {
  const {
    user,
    isLoading: isAuthLoading,
    updateUserDetail,
    isVerified,
    loginWithGoogle,
    loginWithMal,
  } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthLoading && !isVerified) {
      router.replace('/auth');
    }
  }, [isAuthLoading, isVerified, router]);

  return (
    <div className="flex flex-col gap-5 sm:gap-8 lg:mb-12">
      <AppTitle title="Pengaturan Akun" />
      <div className="w-full flex flex-col gap-5 sm:gap-10 justify-center items-center sm:flex-row sm:flex-wrap">
        <ProfileSection
          user={user}
          isLoading={isAuthLoading}
          updateUserDetail={updateUserDetail}
        />
        <ImportSection user={user} />
        <ThirdPartySection
          user={user}
          isLoading={isAuthLoading}
          loginWithGoogle={loginWithGoogle}
          loginWithMal={loginWithMal}
          router={router}
        />
      </div>
    </div>
  );
}

function ItemWrapper({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="w-full px-6 pb-8 sm:w-85">
      <p className="font-bold text-lg text-center">{title}</p>
      {children}
    </Card>
  );
}

function ProfileSection({
  user,
  isLoading,
  updateUserDetail,
}: {
  user: User | null;
  isLoading: boolean;
  updateUserDetail: (payload: UpdateUserDetail) => Promise<void>;
}) {
  const form = useForm({
    resolver: zodResolver(UserValidation.UPDATE_USER_DETAIL),
    mode: 'onChange',
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
    },
  });
  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (user && !isLoading) {
      form.setValues(
        {
          username: user.username || '',
          email: user.email || '',
        },
        {
          shouldDirty: false,
          shouldValidate: true,
        },
      );
    }
  }, [user, isLoading, form]);

  async function onSubmit(data: UpdateUserDetail) {
    try {
      await updateUserDetail(data);
      toast.add({
        type: 'success',
        description: 'Data profil berhasil diperbarui',
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.BadRequest) {
          const zodErrors = error.response.data as ApiValidationError;
          zodErrors.error.forEach((issue) => {
            const field = issue.path[0] as keyof UpdateUserDetail;
            form.setError(field, {
              message: issue.message,
            });
          });
        } else if (error.status === HttpStatusCode.UnprocessableContent) {
          form.setValue('email', user?.email || '', {
            shouldDirty: false,
            shouldValidate: true,
          });
          if (error.message.includes('Google')) {
            toast.add({
              type: 'error',
              description:
                'Akun sudah terhubung dengan Google. Email tidak dapat dihapus',
            });
          } else {
            toast.add({
              type: 'error',
              description: 'Email tidak dapat dihapus',
            });
          }
        } else if (error.status === HttpStatusCode.Conflict) {
          toast.add({
            type: 'error',
            description: 'Username atau email sudah digunakan',
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
    <ItemWrapper title="Profil">
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-3">
          <InputField
            form={form}
            inputName="username"
            inputPlaceholder="Username"
            inputLabel="Username"
            isDisable={isSubmitting}
          />
          <InputField
            form={form}
            inputName="email"
            inputPlaceholder="Email"
            inputLabel="Email"
            isDisable={isSubmitting}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          Simpan
          {isSubmitting ? <Spinner /> : <Check />}
        </Button>
      </form>
    </ItemWrapper>
  );
}

function ImportSection({ user }: { user: User | null }) {
  const importTypeOptions = [
    {
      value: UserValidation.ImportType.latest_updated,
      label: 'Terakhir diperbarui',
      description:
        'Menambahkan list baru, data lama akan ditimpa jika data dari MyAnimeList lebih baru',
    },
    {
      value: UserValidation.ImportType.skip_duplicates,
      label: 'Lewati duplikat',
      description:
        'Hanya menambahkan list yang belum ada, jika sudah ada akan dilewati',
    },
    {
      value: UserValidation.ImportType.overwrite_all,
      label: 'Timpa semua',
      description:
        'Menambahkan list baru, jika sudah ada akan ditimpa dengan data dari MyAnimeList',
    },
  ];

  const form = useForm({
    resolver: zodResolver(UserValidation.IMPORT_ANIME_LIST_FROM_MAL),
    mode: 'onChange',
    defaultValues: {
      importType: importTypeOptions[0].value,
      isSyncedWithMal: true,
    },
  });
  const { isSubmitting } = form.formState;

  async function onSubmit(data: ImportAnimeListFromMal) {
    try {
      const count = (await userService.importAnimeListFromMal(data)).data.count;
      toast.add({
        type: 'success',
        description: count
          ? `${count} list anime berhasil diperbarui`
          : 'Tidak ada list anime yang diperbarui',
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.BadRequest) {
          const zodErrors = error.response.data as ApiValidationError;
          zodErrors.error.forEach((issue) => {
            const field = issue.path[0] as keyof ImportAnimeListFromMal;
            form.setError(field, {
              message: issue.message,
            });
          });
        } else if (error.status === HttpStatusCode.TooManyRequests) {
          toast.add({
            type: 'error',
            description:
              'Hanya boleh dilakukan sekali setiap menit. Silakan coba lagi nanti',
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

  const importType = useWatch({
    control: form.control,
    name: 'importType',
  });
  const description =
    importTypeOptions.find((option) => option.value === importType)
      ?.description || importTypeOptions[0].description;

  return (
    <ItemWrapper title="Import List dari MyAnimeList">
      {user?.malId ? (
        <form
          className="flex flex-col gap-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-3">
            <SelectField
              form={form}
              options={importTypeOptions}
              inputName="importType"
              inputLabel="Tipe import"
              isDisable={isSubmitting}
            />
            <SwitchField
              form={form}
              inputName="isSyncedWithMal"
              inputLabel="Sinkronisasi dengan MyAnimeList"
              labelPosition="right"
              isDisable={isSubmitting}
            />
          </div>

          <p className="text-center">{description}</p>

          <Button type="submit" disabled={isSubmitting}>
            Mulai Proses Import
            {isSubmitting ? <Spinner /> : <Plus />}
          </Button>
        </form>
      ) : (
        <p className="text-center">
          Hubungkan akun dengan MyAnimeList untuk mulai melakukan import
        </p>
      )}
    </ItemWrapper>
  );
}

function ThirdPartySection({
  user,
  isLoading,
  loginWithGoogle,
  loginWithMal,
  router,
}: {
  user: User | null;
  isLoading: boolean;
  loginWithGoogle: (payload: ThirdPartyLogin) => Promise<void>;
  loginWithMal: (payload: ThirdPartyLogin) => Promise<void>;
  router: AppRouterInstance;
}) {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingMal, setIsLoadingMal] = useState(false);

  const params = useSearchParams();
  const state = params.get('state');
  const iss = params.get('iss');
  const code = params.get('code');
  const google = 'https://accounts.google.com';

  const didRun = useRef(false);
  useEffect(() => {
    async function handleConnect() {
      try {
        if (state && code) {
          didRun.current = true;
          if (iss === google && !user?.googleId) {
            await loginWithGoogle({ state, code });
            toast.add({
              type: 'success',
              description: `Berhasil menghubungkan akun dengan Google`,
            });
          } else if (!user?.malId) {
            await loginWithMal({ state, code });
            toast.add({
              type: 'success',
              description: `Berhasil menghubungkan akun dengan MyAnimeList`,
            });
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.data) {
          if (error.status === HttpStatusCode.UnprocessableContent) {
            toast.add({
              type: 'error',
              description: `Akun sudah terhubung dengan ${iss === google ? 'Google' : 'MyAnimeList'}`,
            });
          } else if (error.status === HttpStatusCode.Conflict) {
            toast.add({
              type: 'error',
              description: `Sudah ada akun yang terhubung dengan akun ${iss === google ? 'Google' : 'MyAnimeList'} ini`,
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
      } finally {
        router.replace('/user/settings');
      }
    }

    if (didRun.current) return;
    didRun.current = true;
    void handleConnect();
  }, [
    code,
    iss,
    loginWithGoogle,
    loginWithMal,
    router,
    state,
    user?.googleId,
    user?.malId,
  ]);

  async function onClickGoogle() {
    try {
      setIsLoadingGoogle(true);
      if (user?.googleId) {
        toast.add({
          type: 'error',
          description: `Akun sudah terhubung dengan Google`,
        });
        return;
      }
      const { data } = await authService.getGoogleAuthUrl({ mode: 'connect' });
      redirect(data.url);
    } finally {
      setIsLoadingGoogle(false);
    }
  }

  async function onClickMal() {
    try {
      setIsLoadingMal(true);
      if (user?.malId) {
        toast.add({
          type: 'error',
          description: `Akun sudah terhubung dengan MyAnimeList`,
        });
        return;
      }
      const { data } = await authService.getMalAuthUrl({ mode: 'connect' });
      redirect(data.url);
    } finally {
      setIsLoadingMal(false);
    }
  }

  return (
    <div className="w-full sm:w-fit flex flex-col items-center">
      <div className="relative hidden lg:block w-40 h-29">
        <Image
          src={'/oke.png'}
          alt="Anime Oke"
          fill
          className="object-contain"
          sizes="402px"
          loading={'eager'}
        />
      </div>

      <ItemWrapper title="Akun Eksternal">
        <div className="flex flex-col gap-5">
          <Button
            variant={'outline'}
            onClick={onClickGoogle}
            disabled={isLoading || isLoadingGoogle || isLoadingMal}
          >
            {isLoadingGoogle ? (
              <Spinner />
            ) : (
              <Image
                src={'/google.png'}
                alt="google logo"
                width={16}
                height={16}
              />
            )}
            {user?.googleId ? 'Terhubung' : 'Belum Terhubung'}
          </Button>
          <Button
            variant={'ghost'}
            onClick={onClickMal}
            disabled={isLoading || isLoadingGoogle || isLoadingMal}
            className={`bg-app-blue hover:text-white hover:bg-app-blue text-white [&_svg:not([class*='size-'])]:size-6`}
          >
            {isLoadingMal ? (
              <Spinner />
            ) : (
              <Image
                src={'/mal.png'}
                alt="google logo"
                width={24}
                height={24}
              />
            )}
            {user?.malId ? 'Terhubung' : 'Belum Terhubung'}
          </Button>
        </div>
      </ItemWrapper>
    </div>
  );
}
