'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Anime } from '@/types/anime.model';
import type { AnimePlatform as AnimePlatformType } from '@/types/anime-platform.model';
import AnimePlatform from '@/components/anime-platform';
import { UserAnimeList } from '@/types/user-anime-list.model';
import dayjs from 'dayjs';
import { Skeleton } from '@/components/ui/skeleton';
import AnimeList from '@/components/anime-list';
import getEpisodeAired from '@/helper/get-episode-aired';
import getCurrentSeason from '@/helper/get-current-season';
import { Progress } from '@/components/ui/progress';
import AnimeScore from '@/components/anime-score';
import AnimeEpisodeAired from '@/components/anime-episode-aired';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateOrUpdateUserAnimeList } from '@/validator/user-anime-list.validation';
import userAnimeListService from '@/services/user-anime-list.service';
import { toast } from '@/components/ui/toast';
import axios from 'axios';
import { ApiExpectedError } from '@/types';
import CustomError from '@/helper/custom-error';

export function ListAnime({
  anime,
}: {
  anime: Anime & {
    animePlatforms: AnimePlatformType[];
    userAnimeList?: UserAnimeList | null;
  };
}) {
  const episodeAired = getEpisodeAired(
    anime.status,
    anime.episodeTotal,
    anime.animePlatforms[0],
  );
  const season = anime.releaseAt
    ? getCurrentSeason(dayjs(anime.releaseAt))
    : null;

  const ratio = anime.episodeTotal ? 100 / anime.episodeTotal : 0;

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ['anime'],
    mutationFn: async (progress: CreateOrUpdateUserAnimeList['progress']) => {
      if (progress && progress < 0) {
        throw new CustomError('Progress menonton tidak boleh kurang dari 0');
      }

      if (
        progress === undefined ||
        (anime.episodeTotal > 0 && progress > anime.episodeTotal)
      ) {
        throw new CustomError('Progres menonton sudah mencapai episode terakhir');
      }

      await userAnimeListService.createOrUpdate({ progress }, anime.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime'] });
      toast.add({
        type: 'success',
        description: `Berhasil memperbarui progres menonton ${anime.title}`,
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        const expectedError = error.response.data as ApiExpectedError;
        toast.add({
          type: 'error',
          description: expectedError.message,
        });
      } else if (error instanceof CustomError) {
        toast.add({
          type: 'error',
          description: error.message,
        });
      } else {
        toast.add({
          type: 'error',
          description:
            'Gagal terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
        });
      }
    },
  });

  return (
    <Card className="flex flex-row p-0 gap-0 rounded-lg">
      <div className="w-30 sm:w-43 h-40 sm:h-60 relative">
        <Image
          src={anime.picture}
          alt={anime.title}
          sizes="120px"
          loading={'lazy'}
          className="object-cover"
          fill
        />

        {/* Mobile */}
        <div className="block sm:hidden absolute -bottom-px -left-px">
          <AnimeScore
            malId={anime.malId}
            score={anime.userAnimeList?.score}
            scoreSource="user"
          />
        </div>
        <div className="sm:hidden absolute -top-px -left-px">
          <AnimeList anime={anime} />
        </div>
      </div>
      <div className="flex flex-col pl-3 pt-1.5 pb-2 pr-2 w-50 sm:w-60 h-40 sm:h-60 justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-bold line-clamp-2 sm:line-clamp-3">{anime.title}</p>
          {season && (
            <p className="text-xs">
              {season.season.charAt(0).toUpperCase() + season.season.slice(1)}{' '}
              {season.year}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            {/* Mobile */}
            <p className="block sm:hidden text-xs text-right">
              {anime.userAnimeList?.progress || 0} /{' '}
              {`${anime.episodeTotal || '?'}`} ep
            </p>

            {/* Dekstop */}
            <div className="hidden sm:flex gap-2">
              <AnimeScore
                score={anime.userAnimeList?.score}
                malId={anime.malId}
                scoreSource="user"
              />
              <AnimeList anime={anime} />
            </div>

            <div className="flex gap-2">
              <Button
                size={'xs'}
                variant={'red'}
                onClick={() => {
                  mutation.mutate((anime.userAnimeList?.progress ?? 0) - 1);
                }}
              >
                <Minus />
              </Button>
              <Button
                size={'xs'}
                onClick={() => {
                  mutation.mutate((anime.userAnimeList?.progress ?? 0) + 1);
                }}
              >
                <Plus />
              </Button>
            </div>
          </div>

          <Progress
            value={
              ratio && anime.userAnimeList
                ? ratio * anime.userAnimeList.progress
                : 50
            }
          />

          {/* Dekstop */}
          <p className="hidden sm:block text-xs text-right">
            {anime.userAnimeList?.progress || 0} /{' '}
            {`${anime.episodeTotal || '?'}`} ep
          </p>
        </div>

        {/* Mobile */}
        {anime.animePlatforms[0]?.id && (
          <ScrollArea className="sm:hidden">
            <AnimePlatform platforms={anime.animePlatforms} />
          </ScrollArea>
        )}

        {/* Dekstop */}
        {(anime.animePlatforms[0]?.id || episodeAired) && (
          <div className="hidden sm:flex justify-between items-end">
            {episodeAired && (
              <AnimeEpisodeAired
                episodeAired={episodeAired}
                status={anime.status}
                firstAnimePlatformLink={anime.animePlatforms[0]?.link.url}
              />
            )}
            {anime.animePlatforms[0]?.id && (
              <ScrollArea
                className={`hidden sm:flex${episodeAired ? ' max-w-40' : ''}`}
              >
                <AnimePlatform platforms={anime.animePlatforms} />
              </ScrollArea>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export function SkeletonAnime({ className = '' }: { className?: string }) {
  return (
    <Card className={`flex flex-row p-0 gap-0 rounded-lg ${className}`}>
      <Skeleton className="w-30 sm:w-43 h-40 sm:h-60 rounded-none" />
      <div className="flex flex-col pl-3 pt-1.5 pb-2 pr-2 w-50 sm:w-60 h-40 sm:h-60 justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div className="hidden sm:flex gap-2">
              <Skeleton className='h-6 w-10' />
              <Skeleton className='h-6 w-10' />
            </div>
            <Skeleton className='h-4 w-12' />
            <div className="flex gap-2">
              <Skeleton className='h-6 w-8' />
              <Skeleton className='h-6 w-8' />
            </div>
          </div>

          <Skeleton className='h-2 w-full' />

          <div className="hidden sm:flex justify-end w-full">
            <Skeleton className='h-4 w-12' />
          </div>
        </div>
        <div className="flex justify-between">
          <Skeleton className='hidden sm:block w-10 h-6' />
          <div className="flex gap-1">
            <Skeleton className='w-6 h-6' />
            <Skeleton className='w-6 h-6' />
          </div>
        </div>
      </div>
    </Card>
  );
}
