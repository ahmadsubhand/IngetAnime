import TimelineDay from '@/app/timeline/timeline';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Slider from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';
import { AnimeDailyTimeline } from '@/types/anime-exploration.model';

import dayjs from 'dayjs';
import locale_id from 'dayjs/locale/id';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.locale(locale_id);
dayjs.extend(isSameOrBefore);

export default function TimelineDekstop({
  dailyTimelines,
  isLoading = false,
}: {
  dailyTimelines?: AnimeDailyTimeline[];
  isLoading?: boolean;
}) {
  const isLg = useIsMobile(1024);
  const isMd = useIsMobile(768);

  return (
    <div
      className={
        'hidden sm:block max-w-120 md:max-w-180 lg:max-w-235 xl:max-w-310'
      }
    >
      <Slider
        slidesToShow={isMd ? 1 : isLg ? 2 : 3}
        slidesToScroll={isMd ? 1 : isLg ? 2 : 3}
        initialSlide={isMd ? 6 : 5}
        key={isMd ? 6 : 5}
      >
        {!isLoading && dailyTimelines?.length
          ? dailyTimelines.map((dailyTimeline) => {
              const dateTime = dayjs(dailyTimeline.dateTime);
              const isSameDay = dateTime.isSame(dayjs(), 'day');
              return (
                <Card
                  className="p-5"
                  key={`card-${dateTime.toISOString()}`}
                  style={{ width: 500 }}
                >
                  <div className="flex flex-col gap-1 w-full text-center mb-2 select-none">
                    <span className="font-bold tracking-wide">
                      {isSameDay ? 'Hari ini' : dateTime.format('dddd')}
                    </span>
                    <span>
                      {isSameDay
                        ? dateTime.format('dddd')
                        : dateTime.format('D')}
                    </span>
                  </div>

                  <TimelineDay dailyTimeline={dailyTimeline} />
                </Card>
              );
            })
          : Array.from({ length: 13 }).map((_, index) => {
              // 6 + 1 + 6
              const isBeforeToday = index < 6;
              const dateTime = isBeforeToday
                ? dayjs().subtract(6 - index, 'day')
                : dayjs().add(index - 6, 'day');
              const isSameDay = dateTime.isSame(dayjs(), 'day');
              return (
                <Card
                  className="p-5"
                  key={`card-${dateTime.toISOString()}`}
                  style={{ width: 500 }}
                >
                  <div className="flex flex-col gap-1 w-full text-center mb-2 select-none">
                    <span className="font-bold tracking-wide">
                      {isSameDay ? 'Hari ini' : dateTime.format('dddd')}
                    </span>
                    <span>
                      {isSameDay
                        ? dateTime.format('dddd')
                        : dateTime.format('D')}
                    </span>
                  </div>

                  <div className="flex w-full flex-col gap-2">
                    <Skeleton className="w-full h-35" />
                  </div>
                </Card>
              );
            })}
      </Slider>
    </div>
  );
}
