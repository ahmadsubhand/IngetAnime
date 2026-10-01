"use client"

import Image from 'next/image';
import AppTitle from '../../../components/app-title';
import { ExplorationAnime, SkeletonAnime } from '../../../components/exploration-anime';
import { useInfiniteQuery } from '@tanstack/react-query';
import animeExplorationService from '../../../services/anime-exploration.service';
import { useEffect, useState } from 'react';
import { RankingType } from '../../../enums';
import { Field, FieldLabel } from '../../../components/ui/field';
import { useIsMobile } from '../../../hooks/use-mobile';
import { useInView } from 'react-intersection-observer';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { AlertDialog, AlertDialogContent } from '../../../components/ui/alert-dialog';
import { Spinner } from '../../../components/ui/spinner';

export default function BestPage() {
  const isMobile = useIsMobile();
  const limit = isMobile ? 10 : 30;
  const rankingTypes = [
    { label: "Semua", value: RankingType.all },
    { label: "TV series", value: RankingType.tv },
    { label: "Film", value: RankingType.movie },
    { label: "OVA", value: RankingType.ova },
    { label: "Spesial", value: RankingType.special },
    { label: "Sedang tayang", value: RankingType.airing },
    { label: "Segera tayang", value: RankingType.upcoming },
    { label: "Terpopuler", value: RankingType.bypopularity },
    { label: "Terfavorit", value: RankingType.favorite },
  ]
  const [rankingType, setRankingType] = useState<RankingType>(RankingType.all);

  const { data, fetchNextPage, status, isFetchingNextPage, hasNextPage, isRefetching } = useInfiniteQuery({
    queryKey: ['anime', 'ranking', { ranking_type: rankingType }],
    initialPageParam: {
      limit,
      offset: 0,
    },
    queryFn: async ({ pageParam }) => {
      const response = await animeExplorationService.getAnimeRanking({ 
        ...pageParam,
        ranking_type: rankingType,
        fields: 'synopsis,genres,average_episode_duration,mean'
      })
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.paging?.next) {
        return undefined;
      }

      const url = new URL(lastPage.paging.next);

      return {
        limit,
        offset: Number(url.searchParams.get('offset')),
      };
    },
    staleTime: Infinity,
  })

  const animes = data?.pages.flatMap((page) => page.anime) ?? [];

  const { ref, inView } = useInView({
    rootMargin: '400px'
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  return <>
    <AppTitle title='Anime Terbaik'
      subtitle='Temukan anime dengan rating tertinggi dan kualitas terbaik untuk kamu tonton sekarang!' 
    />

    <Field className='self-start' orientation={'horizontal'}>
      <FieldLabel htmlFor='ranking-type'>Jenis Peringkat</FieldLabel>
      <Select items={rankingTypes} value={rankingType} onValueChange={(value) => setRankingType(value ?? RankingType.all)}>
        <SelectTrigger className={`bg-background w-full`} id='ranking-type'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Jenis Peringkat</SelectLabel>
            {rankingTypes.map((option) => (
              <SelectItem value={option.value} key={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
    
    <div className="w-full flex sm:flex-wrap flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:justify-center">
      {animes.map((anime) => (
        <ExplorationAnime anime={anime} key={anime.id} />
      ))}
      <div ref={ref} className="w-full flex sm:flex-wrap flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:justify-center">
        {(status === 'pending' || isFetchingNextPage) && Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
          <SkeletonAnime key={i} />
        ))}
      </div>
      <AlertDialog open={isRefetching}>
        <AlertDialogContent className={'flex flex-row items-center w-fit gap-3'}>
          <Spinner className='size-6 text-muted-foreground' />
          <p className='text-muted-foreground'>Memperbarui data ...</p>
        </AlertDialogContent>
      </AlertDialog>
    </div>

    <div className="hidden sm:block fixed w-77 h-110 -left-10 -bottom-5 -z-1">
      <Image src={'/conan.png'} alt='Edogawa Conan' fill className='object-contain' sizes='308px' loading={'eager'} />
    </div>
    <div className="hidden sm:block fixed w-70 h-84 -right-20 -bottom-5 -z-1">
      <Image src={'/haibara.png'} alt='Haibara Ai' fill className='object-contain' sizes='240px' loading={'eager'} />
    </div>
  </>
}