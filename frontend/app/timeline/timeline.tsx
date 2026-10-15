'use client';

import AnimeSettings from '@/components/anime-settings';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/providers/auth-provider';
import {
  AnimeDailyTimeline,
  AnimeTimeline,
  AnimeWithSchedule,
} from '@/types/anime-exploration.model';
import dayjs, { Dayjs } from 'dayjs';
import locale_id from 'dayjs/locale/id';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Circle, Clock } from 'lucide-react';
import Image from 'next/image';
import AnimePlatform from '@/components/anime-platform';
import AnimeList from '@/components/anime-list';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

dayjs.locale(locale_id);
dayjs.extend(isSameOrBefore);

export default function TimelineDay({
  dailyTimeline,
  isDisplay = false,
}: {
  dailyTimeline: AnimeDailyTimeline;
  isDisplay?: boolean;
}) {
  const dateTime = dayjs(dailyTimeline.dateTime);
  const now = isDisplay ? dayjs().hour(10).minute(30) : dayjs();
  const indexFirstPass = (dailyTimeline.timelines.findIndex((timeline) => {
    const dateTime = dayjs(timeline.dateTime);
    return dateTime.isSame(now, 'day') && dateTime.isAfter(now);
  })) - 1;
  const isSm = useIsMobile();

  return (
    <div className="w-full h-full flex flex-col gap-2 select-none">
      {dailyTimeline.timelines.length ? (
        dailyTimeline.timelines.map((timeline, index) => (
          <div
            className="flex flex-col gap-2"
            key={`item-${dayjs(timeline.dateTime).toISOString()}`}
          >
            {indexFirstPass < 0 &&
              index === 0 &&
              dateTime.isSame(now, 'day') && (
                <TimelineTimeNow dateTimeNow={now} isSm={isSm} />
              )}
            <TimelineTime
              timeline={timeline}
              dateTimeNow={now}
              isDisplay={isDisplay}
              isSm={isSm}
            />
            {indexFirstPass > -1 && index === indexFirstPass && (
              <TimelineTimeNow
                dateTimeNow={now}
                isSm={isSm}
                isLast={dailyTimeline.timelines.length - 1 === index}
              />
            )}
          </div>
        ))
      ) : (
        // kecil sm:besar lg:kecil xl:besar
        <p className="text-center mt-11 mb-12 lg:mb-9 xl:mb-12 px-10 sm:px-15 text-sm sm:text-base lg:text-sm xl:text-base">
          Tidak ada anime yang tayang pada hari ini
        </p>
      )}
    </div>
  );
}

function TimelineTimeNow({
  dateTimeNow,
  isSm,
  isLast = false,
}: {
  dateTimeNow: Dayjs;
  isSm: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-1 sm:gap-3">
      <div className="flex flex-col gap-2 items-center">
        <div
          className={`flex w-4 sm:w-6 h-4 sm:h-6 items-center justify-center bg-primary rounded-full shrink-0`}
        >
          <Clock size={isSm ? 13 : 19} className="text-primary-foreground" />
        </div>
        {!isLast && <div className={`w-0.5 sm:w-1 h-5 bg-primary`} />}
      </div>

      <p className="-translate-y-0.5 sm:translate-y-0.5">
        {`Waktu saat ini: ${dateTimeNow.format('HH:mm')}`}
      </p>
    </div>
  );
}

function TimelineTime({
  timeline,
  dateTimeNow,
  isSm,
  isDisplay = false,
}: {
  timeline: AnimeTimeline;
  dateTimeNow: Dayjs;
  isSm: boolean;
  isDisplay?: boolean;
}) {
  const dateTime = dayjs(timeline.dateTime);
  const isPass =
    dateTime.isSameOrBefore(dateTimeNow) && dateTime.isSame(dateTimeNow, 'day');

  return (
    <div className="flex gap-1 sm:gap-3">
      <div className="flex flex-col gap-2 items-center">
        <div
          className={`flex w-4 sm:w-6 h-4 sm:h-6 items-center justify-center ${isPass ? 'bg-primary' : 'bg-app-gray'} rounded-full shrink-0`}
        >
          <Circle size={isSm ? 13 : 19} className="text-primary-foreground" />
        </div>
        <div
          className={`w-0.5 sm:w-1 h-full ${isPass ? 'bg-primary' : 'bg-app-gray'}`}
        />
      </div>

      <div className="flex flex-col gap-2 w-full">
        <p className='-translate-y-0.5 sm:translate-y-0'>{dateTime.format('HH:mm')}</p>
        {timeline.anime.map((anime) => (
          <TimelineAnime
            animeWithSchedule={anime}
            key={anime.id}
            dateTimeNow={dateTimeNow}
            isDisplay={isDisplay}
          />
        ))}
      </div>
    </div>
  );
}

function TimelineAnime({
  animeWithSchedule,
  dateTimeNow,
  isDisplay = false,
}: {
  animeWithSchedule: AnimeWithSchedule;
  dateTimeNow: Dayjs;
  isDisplay?: boolean;
}) {
  const isPass = dayjs(animeWithSchedule.schedule.dateTime).isSameOrBefore(
    dateTimeNow,
  );
  const { isLoading, isAdmin } = useAuth();
  return (
    <div className="w-full flex gap-3">
      <div className="w-25 lg:w-18 xl:w-20 h-33 lg:h-28 xl:h-28 relative shrink-0">
        <Image
          src={animeWithSchedule.picture}
          alt={animeWithSchedule.title}
          sizes="150px"
          loading={'lazy'}
          className="object-cover"
          fill
        />
        {!isLoading && isAdmin && (
          <div className="absolute -top-px -left-px">
            <AnimeSettings anime={animeWithSchedule} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 justify-between w-full">
        <Tooltip>
          <TooltipTrigger
            render={
              <p className="font-bold line-clamp-2 text-xs sm:text-sm lg:text-xs xl:text-sm">
                {animeWithSchedule.title}
              </p>
            }
          />
          <TooltipContent>{animeWithSchedule.title}</TooltipContent>
        </Tooltip>
        <ScrollArea>
          <AnimePlatform platforms={animeWithSchedule.animePlatforms} isDisplay={isDisplay} />
        </ScrollArea>
        <div className="flex justify-between items-end gap-3 text-xs sm:text-sm lg:text-xs xl:text-sm">
          {`E${animeWithSchedule.schedule.episodeNumber} ${isPass ? 'sudah' : 'belum'} tayang`}
          <AnimeList anime={animeWithSchedule} />
        </div>
      </div>
    </div>
  );
}
