'use client';

import { useForm } from 'react-hook-form';
import AnimeSearch from './anime-search';
import AppLogo from './app-logo';
import AppProfile from './app-profile';
import { AppSidebar } from './app-sidebar';
import { SidebarTrigger } from './ui/sidebar';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AnimeExplorationValidation,
  GetAnimeList,
} from '../validator/anime-exploration.validation';
import { Suspense, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function AppHeader({ className = '' }: { className?: string }) {
  return (
    <Suspense fallback={<HeaderLoding className={className} />}>
      <HeaderContent className={className} />
    </Suspense>
  )
}

function HeaderContent({ className = '' }: { className?: string }) {
  const searchParams = useSearchParams();
  const qFromParam = searchParams.get('q') || '';

  const form = useForm({
    resolver: zodResolver(AnimeExplorationValidation.GET_ANIME_LIST),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    defaultValues: {
      q: qFromParam,
    },
  });
  const { isSubmitting } = form.formState;

  const router = useRouter();
  function onSubmit(data: GetAnimeList) {
    router.push(`/anime/exploration/search?q=${data.q}`);
  }

  useEffect(() => {
    form.setValue('q', qFromParam);
  }, [qFromParam, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
      <header className="pr-4 py-4 flex justify-between">
        <SidebarTrigger className={'md:hidden'} />
        <AppLogo className="pl-2" />
        <AnimeSearch
          form={form}
          inputName="q"
          isDisable={isSubmitting}
          className="ml-5 md:max-w-100"
        />

        <div className="flex gap-6">
          <AppSidebar
            animeSearch={
              <AnimeSearch
                form={form}
                inputName="q"
                isDisable={isSubmitting}
              />
            }
          />
          <div className="hidden md:block">
            <AppProfile size="sm" />
          </div>
        </div>
      </header>
    </form>
  );
}

function HeaderLoding({ className = '' }: { className?: string }) {
  return (
    <header className={`pr-4 py-4 flex justify-between items-center gap-4 ${className}`}>
      {/* <SidebarTrigger className={'md:hidden'} disabled /> */}
      <Skeleton className='md:hidden w-9 h-9 ml-2' />
      <Skeleton className='w-29 h-9 md:ml-2' />
      <Skeleton className='w-full md:w-70 lg:w-100 h-9' />

      <div className="hidden md:flex gap-6">
        <div className="flex gap-4">
          <Skeleton className='w-16 lg:w-20 h-9' />
          <Skeleton className='w-16 lg:w-20 h-9' />
          <Skeleton className='w-16 lg:w-20 h-9' />
        </div>
        {/* <AppSidebarSkeleton /> */}
        <div className="hidden md:block">
          <Button size={'icon'} disabled variant={'outline'}>
            <Spinner />
          </Button>
        </div>
      </div>
    </header>
  )
}
