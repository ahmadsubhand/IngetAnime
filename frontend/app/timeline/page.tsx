'use client';

import AnimeUpdate from '@/components/anime-update';
import { Field, FieldLabel } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import animeExplorationService from '@/services/anime-exploration.service';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';

import locale_id from 'dayjs/locale/id';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import TimelineMobile from '@/app/timeline/mobile';
import TimelineDekstop from '@/app/timeline/dekstop';
import Image from 'next/image';

dayjs.locale(locale_id);
dayjs.extend(isSameOrBefore);

export default function TimelinePage() {
  const [myListOnly, setMyListOnly] = useState(false);
  const [selectedPlatformSchedule, setSelectedPlatformSchedule] =
    useState(true);

  const isMobile = useIsMobile();

  const {
    data: dailyTimelines,
    isRefetching,
    isFetching,
  } = useQuery({
    queryKey: [
      'anime',
      'timeline',
      myListOnly,
      selectedPlatformSchedule,
      isMobile,
    ],
    queryFn: async () => {
      const { data } = await animeExplorationService.getAnimeTimeline({
        week_count: isMobile ? 1 : 2,
        time_zone: 'Asia/Jakarta',
        my_list_only: myListOnly,
        original_schedule: !selectedPlatformSchedule,
      });
      return data;
    },
    staleTime: Infinity,
  });

  return (
    <>
      <div className="flex flex-col gap-5 px-5">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-bold">Jadwal Rilis</h1>
          <p className="hidden sm:block">
            Lihat timeline jadwal rilis anime mingguan dari berbagai platform
            dalam satu tampilan praktis!
          </p>
        </div>

        <div className="flex gap-2 md:gap-8 items-center justify-center w-full flex-wrap md:flex-nowrap">
          <Field orientation={'horizontal'} className="w-fit">
            <Switch
              id={'my-list-only'}
              disabled={isFetching}
              checked={myListOnly}
              onCheckedChange={setMyListOnly}
            />
            <FieldLabel
              htmlFor={'my-list-only'}
              className={`flex gap-2 items-center`}
            >
              Hanya tampilkan yang ada di list saya
            </FieldLabel>
          </Field>

          <Field orientation={'horizontal'} className="w-fit">
            <Switch
              id={'selected-platform-schedule'}
              disabled={isFetching}
              checked={selectedPlatformSchedule}
              onCheckedChange={setSelectedPlatformSchedule}
            />
            <FieldLabel
              htmlFor={'selected-platform-schedule'}
              className={`flex gap-2 items-center`}
            >
              Tampilkan jadwal sesuai platform yang saya pilih
            </FieldLabel>
          </Field>
        </div>
      </div>

      <TimelineMobile dailyTimelines={dailyTimelines} isLoading={isFetching} />

      <TimelineDekstop dailyTimelines={dailyTimelines} isLoading={isFetching} />

      <AnimeUpdate isOpen={isRefetching} />

      {/* <div className="hidden sm:block fixed w-28 h-60 left-9 md:left-12 top-70 md:top-56 -z-1 -scale-x-100">
        <Image
          src={'/timeline-left.png'}
          alt="Anime Girl Left"
          fill
          className="object-contain"
          sizes="512px"
          loading={'eager'}
        />
      </div> */}
      <div className="hidden sm:block fixed w-25 h-50 right-0 bottom-0 -z-1">
        <Image
          src={'/timeline-right.png'}
          alt="Anime Girl Right"
          fill
          className="object-contain"
          sizes="378px"
          loading={'eager'}
        />
      </div>
    </>
  );
}
