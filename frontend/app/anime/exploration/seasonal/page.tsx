'use client';

import Image from 'next/image';
import AppTitle from '@/components/app-title';
import { ExplorationAnime, SkeletonAnime } from '../anime';
import { useInfiniteQuery } from '@tanstack/react-query';
import animeExplorationService from '@/services/anime-exploration.service';
import { useEffect, useState } from 'react';
import { Season } from '@/enums';
import { Field, FieldLabel } from '@/components/ui/field';
import { useIsMobile } from '@/hooks/use-mobile';
import { useInView } from 'react-intersection-observer';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import getCurrentSeason from '@/helper/get-current-season';
import AnimeUpdate from '@/components/anime-update';

export default function SeasonalPage() {
  const isMobile = useIsMobile();
  const limit = isMobile ? 5 : 12;
  const { season: currentSeason, year: currentYear } = getCurrentSeason();

  const seasons = [
    { label: 'Fall', value: Season.fall },
    { label: 'Summer', value: Season.summer },
    { label: 'Spring', value: Season.spring },
    { label: 'Winter', value: Season.winter },
  ];
  const [season, setSeason] = useState<Season>(currentSeason);

  const YEAR_MINIMAL = 1917;
  const years = Array.from({ length: currentYear - YEAR_MINIMAL + 1 }).map(
    (_, i) => {
      const year = currentYear - i;
      return { label: year.toString(), value: year };
    },
  );
  const [year, setYear] = useState(currentYear);

  const {
    data,
    fetchNextPage,
    status,
    isFetchingNextPage,
    hasNextPage,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['anime', 'season', { year, season }],
    initialPageParam: {
      limit,
      offset: 0,
    },
    queryFn: async ({ pageParam }) => {
      const response = await animeExplorationService.getSeasonalAnime(
        {
          ...pageParam,
          fields: 'synopsis,genres,average_episode_duration,mean',
        },
        { year, season },
      );
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
  });

  const animes = data?.pages.flatMap((page) => page.anime) ?? [];

  const { ref, inView } = useInView({
    rootMargin: '400px',
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <>
      <AppTitle
        title="Anime Musiman"
        subtitle="Pantau anime terbaru yang sedang tayang musim ini lengkap dengan jadwal rilisnya!"
      />
      <Field orientation={'horizontal'}>
        <FieldLabel htmlFor="season">Musim</FieldLabel>

        <Select
          disabled={status === 'pending'}
          items={seasons}
          value={season}
          onValueChange={(value) => setSeason(value ?? currentSeason)}
        >
          <SelectTrigger className={`bg-background w-full`} id="season">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Musim</SelectLabel>
              {seasons.map((option) => (
                <SelectItem value={option.value} key={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          disabled={status === 'pending'}
          items={years}
          value={year}
          onValueChange={(value) => setYear(value ?? currentYear)}
        >
          <SelectTrigger className={`bg-background w-full`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Tahun</SelectLabel>
              {years.map((option) => (
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
        <div
          ref={ref}
          className="w-full flex sm:flex-wrap flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:justify-center"
        >
          {(status === 'pending' || isFetchingNextPage) &&
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonAnime key={i} className={i >= 3 ? 'hidden sm:flex' : ''} />
            ))}
        </div>
      </div>

      <AnimeUpdate isOpen={isRefetching} />

      <div className="hidden sm:block fixed w-67 h-120 -left-2 -bottom-20 -z-1">
        <Image
          src={'/nene.png'}
          alt="Sakura Nene"
          fill
          className="object-contain"
          sizes="595px"
          loading={'eager'}
        />
      </div>
      <div className="hidden sm:block fixed w-88 h-119 -right-45 -bottom-20 -z-1">
        <Image
          src={'/aoba.png'}
          alt="Suzukaze Aoba"
          fill
          className="object-contain"
          sizes="1483px"
          loading={'eager'}
        />
      </div>
    </>
  );
}
