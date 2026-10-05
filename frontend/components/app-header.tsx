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
import { useEffect } from 'react';

export default function AppHeader() {
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

  const router = useRouter();
  function onSubmit(data: GetAnimeList) {
    router.push(`/anime/exploration/search?q=${data.q}`);
  }

  useEffect(() => {
    form.setValue('q', qFromParam);
  }, [qFromParam, form]);

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <header className="pr-4 py-4 flex justify-between">
        <SidebarTrigger className={'md:hidden'} />
        <AppLogo className="pl-2" />
        <AnimeSearch
          form={form}
          inputName="q"
          isDisable={form.formState.isSubmitting}
          className="ml-5 md:max-w-100"
        />

        <div className="flex gap-6">
          <AppSidebar
            animeSearch={
              <AnimeSearch
                form={form}
                inputName="q"
                isDisable={form.formState.isSubmitting}
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
