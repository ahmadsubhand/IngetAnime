"use client"

import { Check, Clock, CloudDownload, Plus, Trash, X } from 'lucide-react';
import { UserAnimeList } from '../types/user-anime-list.model';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ListStatus } from '../enums';
import Image from 'next/image';
import { FieldGroup, FieldLabel } from './ui/field';
import SelectField from './select-field';
import { useForm } from 'react-hook-form';
import { CreateOrUpdateUserAnimeList, UserAnimeListValidation } from '../validator/user-anime-list.validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Anime } from '../types/anime.model';
import { AnimePlatform } from '../types/anime-platform.model';
import getEpisodeAired from '../helper/get-episode-aired';
import { ReactNode, useEffect, useState } from 'react';
import DateField from './date-field';
import SwitchField from './switch-field';
import userAnimeListService from '../services/user-anime-list.service';
import axios, { HttpStatusCode } from 'axios';
import { ApiExpectedError, ApiValidationError } from '../types';
import { toast } from './ui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import malService from '../services/mal.service';
import { Switch } from './ui/switch';
import { useIsMobile } from '../hooks/use-mobile';
import { Spinner } from './ui/spinner';
import { useAuth } from '../providers/auth-provider';
import { useRouter } from 'next/navigation';

export default function AnimeList({
  anime
}: { 
  anime: (Anime & {
    animePlatforms: AnimePlatform[];
    userAnimeList?: UserAnimeList | null;
  })
}) {
  const isMobile = useIsMobile();
  const episodeAired = getEpisodeAired(anime.status, anime.episodeTotal, anime.animePlatforms[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const form = useForm<CreateOrUpdateUserAnimeList>({
    resolver: zodResolver(UserAnimeListValidation.CREATE_OR_UPDATE_USER_ANIME_LIST),
    mode: 'onChange',
    defaultValues: anime.userAnimeList ?? {
      startDate: null,
      finishDate: null,
      progress: 0,
      score: 0,
      episodesDifference: 0,
      status: 'plan_to_watch',
      isSyncedWithMal: false,
      animePlatformId: null,
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (!user?.isVerified) {
        router.push('/auth');
      } else {
        form.reset(
          anime.userAnimeList ?? {
            startDate: null,
            finishDate: null,
            progress: 0,
            score: 0,
            episodesDifference: 0,
            status: 'plan_to_watch',
            isSyncedWithMal: false,
            animePlatformId: null,
          }
        );
      }
    }
  }, [isOpen, anime.userAnimeList, form, user?.isVerified, router]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: CreateOrUpdateUserAnimeList) => {
      await userAnimeListService.createOrUpdate(data, anime.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime'] });
      setIsOpen(false);
      toast.add({
        type: 'success',
        description: `Berhasil memperbarui status ${anime.title}`
      })
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.BadRequest) {
          const zodErrors = error.response.data as ApiValidationError;
          zodErrors.error.forEach((issue) => {
            const field = issue.path[0] as keyof CreateOrUpdateUserAnimeList;
            form.setError(field, {
              message: issue.message,
            });
          });
        } else if (error.status === HttpStatusCode.Forbidden) {
          toast.add({
            type: 'error',
            description: 'Akun Anda belum terhubung dengan MyAnimeList. Silakan matikan sinkronisasi dengan MyAnimeList'
          })
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
          description: 'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
        });
      }
    }
  });

  const [isFetchDataFromMal, setIsFetchDataFromMal] = useState(false);
  async function getMyAnimeListStatus() {
    try {
      setIsFetchDataFromMal(true);
      const statusFromMal = (await malService.detail({ fields: 'my_list_status' }, anime.malId)).data.my_list_status;
      if (statusFromMal) {
        form.setValues({
          status: statusFromMal?.status,
          progress: statusFromMal?.num_episodes_watched,
          score: statusFromMal?.score,
          startDate: statusFromMal?.start_date,
          finishDate: statusFromMal?.finish_date,
        })
        toast.add({
          type: 'success',
          description: 'Berhasil mendapatkan status dari MyAnimeList'
        })
      } else {
        throw Error('my_list_status tidak ditemukan');
      }
    } catch {
      toast.add({
        type: 'error',
        description: 
          'Gagal terhubung dengan MyAnimeList. Status anime tidak ditemukan atau akun Anda belum terhubung dengan MyAnimeList.'
      })
    } finally {
      setIsFetchDataFromMal(false);
    }
  }

  const isDisable = mutation.isPending || form.formState.isSubmitting || isFetchDataFromMal;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger render={
          <DialogTrigger render={
            <Button size={"xs"} variant={
              anime.userAnimeList 
              ? anime.userAnimeList.remainingWatchableEpisodes == null ? 'blue'
                : anime.userAnimeList.remainingWatchableEpisodes > 0 ? 'yellow' : 'blue'
              : 'default'
            }>
              {anime.userAnimeList ? (<>
                <Clock data-icon="inline-start" />
                {anime.userAnimeList.remainingWatchableEpisodes ?? '?'}
              </>): (
                <Plus />
              )}
            </Button>
          } />
        } />
        <TooltipContent>
          {anime.userAnimeList ? (
            anime.userAnimeList.remainingWatchableEpisodes == null ? `Episode yang belum ditonton belum bisa dihitung` : 
            anime.userAnimeList.remainingWatchableEpisodes < 0 ? `Ada ${anime.userAnimeList.remainingWatchableEpisodes} episode ditonton lebih awal` : 
            anime.userAnimeList.remainingWatchableEpisodes > 0 ? `Ada ${anime.userAnimeList.remainingWatchableEpisodes} episode yang belum ditonton` :
            `Sudah menonton semua episode terbaru`
          ) : (
            'Tambah ke list saya'
          )}
        </TooltipContent>
      </Tooltip>

      <DialogContent className={'px-0 py-0 w-full h-full sm:h-fit sm:max-w-fit flex gap-0'} showCloseButton={false}>
        <div className="hidden lg:block w-80 h-115 relative">
          <Image
            src={anime.picture}
            alt={anime.title}
            sizes="320px"
            loading={"lazy"}
            className='object-cover'
            fill
          />
        </div>

        <form className='w-full sm:w-155 sm:h-115 py-4 px-5 flex flex-col justify-between gap-4 sm:gap-0' onSubmit={
          form.handleSubmit((data: CreateOrUpdateUserAnimeList) => mutation.mutate(data))
        }>
          <div className="flex flex-col gap-1 text-center">
            <Tooltip>
              <TooltipTrigger render={
                <p className='font-bold text-2xl line-clamp-1'>{anime.title}</p>
              } />
              <TooltipContent>{anime.title}</TooltipContent>
            </Tooltip>
            
            <p>
              {
                anime.status === 'finished_airing' ? 'Selesai tayang' : 
                anime.status === 'currently_airing' ? 'Sedang tayang' :
                'Akan tayang'
              }
              {episodeAired && `, ${episodeAired} eps sudah rilis`}
            </p>
          </div>

          <div className='flex overflow-y-scroll sm:overflow-visible flex-col gap-4 no-scrollbar p-1 sm:p-0'>
            <FieldWrap>
              <SelectField form={form} inputName={'status'} inputLabel={'Status'} isDisable={isDisable} options={[
                { label: 'Berjalan', value: ListStatus.watching },
                { label: 'Selesai', value: ListStatus.completed },
                { label: 'Direncanakan', value: ListStatus.plan_to_watch },
                { label: 'Ditunda', value: ListStatus.on_hold },
                { label: 'Ditinggalkan', value: ListStatus.dropped },
              ]} />
              <SelectField form={form} inputName={'progress'} inputLabel={'Progres'} isDisable={isDisable} options={
                Array.from({ length: (episodeAired ?? 0) + 1 }).map((_, i) => { 
                  return { label: i.toString(), value: i }
                })
              } />
            </FieldWrap>
              
            <FieldWrap>
              <SelectField form={form} inputName={'score'} inputLabel={'Skor'} isDisable={isDisable} options={
                Array.from({ length: 11 }).map((_, i) => { 
                  return { label: i.toString(), value: i }
                })
              } />
              <SelectField form={form} inputName={'animePlatformId'} inputLabel={'Platform'} isDisable={isDisable} options={
                [{ label: 'Tidak ada', value: null as number | null }].concat(
                  anime.animePlatforms.map((platform) => {
                    return { label: platform.platform.name, value: platform.id }
                  })
                )
              } />
            </FieldWrap>

            <FieldWrap>
              <DateField 
                form={form}
                inputName={'startDate'}
                inputLabel={'Mulai nonton'}
                isDisable={isDisable}
                inputPlaceholder='TTTT-BB-HH' 
              />
              <DateField
                form={form}
                inputName={'finishDate'}
                inputLabel={'Selesai nonton'}
                isDisable={isDisable}
                inputPlaceholder='TTTT-BB-HH' 
              />
            </FieldWrap>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <Button variant={'blue'} onClick={getMyAnimeListStatus} disabled={isDisable}>
              {isFetchDataFromMal ? <Spinner data-icon="inline-start" /> : <CloudDownload />}
              Cek status MyAnimeList saya
            </Button>
            <SwitchField
              className='w-fit'
              form={form} 
              inputName={'isSyncedWithMal'} 
              inputLabel={'Sinkronisasi dengan MyAnimeList'}
              isDisable={isDisable}
              labelPosition={isMobile ? 'right' : 'left'}
            />
          </div>

          <div className="flex justify-between items-center mt-1 sm:mt-0">
            <Button 
              variant={'red'} 
              disabled={isDisable || !anime.userAnimeList} 
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash /> <span className='hidden sm:inline'>Hapus</span>
            </Button>
            <div className="flex gap-2 sm:gap-3">
              <DialogClose render={
                <Button variant={'red'} disabled={isDisable}>
                  <X /> Batal
                </Button>
              } />
              <Button type='submit' disabled={isDisable}>
                Simpan
                {(mutation.isPending || form.formState.isSubmitting) ? <Spinner data-icon="inline-start" /> : <Check />}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {anime.userAnimeList && (
      <AnimeListDelete 
        isSyncedWithMalPreviously={anime.userAnimeList.isSyncedWithMal}
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen} 
        setRootDialogOpen={setIsOpen}
        animeId={anime.id} 
        animeTitle={anime.title} 
      />
    )}
    </>
  )
}

function FieldWrap({ children }: { children: ReactNode }) {
  return (
    <FieldGroup className='flex gap-4 flex-col sm:flex-row'>
      {children}
    </FieldGroup>
  )
}

function AnimeListDelete({
  animeId, animeTitle, isSyncedWithMalPreviously, isOpen, setIsOpen, setRootDialogOpen
}: {
  animeId: number;
  animeTitle: string;
  isSyncedWithMalPreviously: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void,
  setRootDialogOpen: (rootDialogOpen: boolean) => void,
}) {
  const [isSyncedWithMal, setIsSyncedWithMal] = useState(isSyncedWithMalPreviously);
  useEffect(() => {
    function initializeIsSyncedWithMal() {
      setIsSyncedWithMal(isSyncedWithMalPreviously);
    }
    if (isOpen) {
      initializeIsSyncedWithMal();
    }
  }, [isOpen, isSyncedWithMalPreviously])
  
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      if (isSyncedWithMal !== isSyncedWithMalPreviously) {
        await userAnimeListService.createOrUpdate({ isSyncedWithMal }, animeId)
      }
      await userAnimeListService.delete(animeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime'] });
      setIsOpen(false);
      setRootDialogOpen(false);
      toast.add({
        type: 'success',
        description: `Berhasil menghapus status ${animeTitle}`
      })
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        if (error.status === HttpStatusCode.Forbidden) {
          toast.add({
            type: 'error',
            description: 'Akun Anda belum terhubung dengan MyAnimeList. Silakan matikan sinkronisasi dengan MyAnimeList'
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
          description: 'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
        });
      }
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className={'text-lg font-semibold'}>Hapus dari list Anda?</DialogTitle>
          <DialogDescription>
            Tindakan ini juga akan menghapus status di MyAnimeList Anda.
            Silakan matikan fitur sinkronisasi jika tetap ingin mempertahankan list di MyAnimeList. <br />
            <span className={`w-full flex gap-2 items-center mt-3`}>
              <Switch 
                id={`is-synced-with-mal-${animeId.toString()}`}
                checked={isSyncedWithMal}
                onCheckedChange={setIsSyncedWithMal}
                disabled={mutation.isPending}
              />
              <FieldLabel htmlFor={`is-synced-with-mal-${animeId.toString()}`}>
                Sinkronisasi dengan MyAnimeList
              </FieldLabel>
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose disabled={mutation.isPending} render={
            <Button variant={'outline'}><X /> Batal</Button>
          } />
          <Button 
            variant={'red'} 
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
            className={'flex-row-reverse sm:flex-row'}
          >
            Hapus
            {mutation.isPending ? <Spinner data-icon="inline-start" /> : <Trash />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}