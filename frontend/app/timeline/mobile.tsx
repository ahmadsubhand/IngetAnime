'use client'

import TimelineDay from '@/app/timeline/timeline';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimeDailyTimeline } from '@/types/anime-exploration.model';
import dayjs from 'dayjs';
import locale_id from 'dayjs/locale/id';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useState } from 'react';

dayjs.locale(locale_id);
dayjs.extend(isSameOrBefore);

export default function TimelineMobile({
  dailyTimelines, isLoading = false,
}: {
  dailyTimelines?: AnimeDailyTimeline[];
  isLoading?: boolean;
}) {
  const [value, setValue] = useState(dayjs().format('YYYY-MM-DD'));

  return (
    <div className="md:hidden w-full flex-1 bg-background px-5 py-3">
      {!isLoading && dailyTimelines?.length ? (
        <Tabs className={'w-full flex items-center justify-center'} value={value} onValueChange={setValue}>
          <ScrollArea
            className="w-full [&:not([data-has-overflow-x])>[data-slot=scroll-area-viewport]]:flex [&:not([data-has-overflow-x])>[data-slot=scroll-area-viewport]]:items-center [&:not([data-has-overflow-x])>[data-slot=scroll-area-viewport]]:justify-center"
          >
            <TabsList variant={'button'} className={'py-0 px-0 overflow-hidden'}>
              {dailyTimelines?.map((dailyTimeline) => {
                const dateTime = dayjs(dailyTimeline.dateTime);
                const isSameDay = dateTime.isSame(dayjs(), 'day');
                return (
                  <TabsTrigger
                    value={dateTime.format('YYYY-MM-DD')}
                    key={`tabs-${dateTime.toISOString()}`}
                    className={'flex-col'}
                  >
                    <span className="font-bold tracking-wide">
                      {isSameDay ? 'Hari ini' : dateTime.format('dddd')}
                    </span>
                    <span>
                      {isSameDay ? dateTime.format('dddd') : dateTime.format('D')}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <ScrollBar orientation="horizontal" className={'translate-y-5'} />
          </ScrollArea>
          {dailyTimelines?.map((dailyTimeline) => {
            const dateTime = dayjs(dailyTimeline.dateTime);
            return (
              <TabsContent
                value={dateTime.format('YYYY-MM-DD')}
                key={`content-${dateTime.toISOString()}`}
                className={'py-5 max-w-80 shrink-0'}
              >
                <TimelineDay dailyTimeline={dailyTimeline} />
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <Tabs className={'w-full flex items-center justify-center'} value={value} onValueChange={setValue}>
          <ScrollArea className={'w-full'}>
            <TabsList variant={'button'} className={'py-0 px-0 overflow-hidden'}>
              {Array.from({ length: 13 }).map((_, index) => {
                const isBeforeToday = index < 6
                const dateTime = isBeforeToday ? dayjs().subtract(6 - index, 'day') : dayjs().add(index - 6, 'day');
                const isSameDay = dateTime.isSame(dayjs(), 'day');
                return (
                  <TabsTrigger
                    value={dateTime.format('YYYY-MM-DD')}
                    key={`tabs-${dateTime.toISOString()}`}
                    className={'flex-col'}
                  >
                    <span className="font-bold tracking-wide">
                      {isSameDay ? 'Hari ini' : dateTime.format('dddd')}
                    </span>
                    <span>
                      {isSameDay ? dateTime.format('dddd') : dateTime.format('D')}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <ScrollBar orientation="horizontal" className={'translate-y-5'} />
          </ScrollArea>
          {Array.from({ length: 13 }).map((_, index) => {
            const isBeforeToday = index < 6
            const dateTime = isBeforeToday ? dayjs().subtract(6 - index, 'day') : dayjs().add(index - 6, 'day');
            return (
              <TabsContent
                value={dateTime.format('YYYY-MM-DD')}
                key={`content-${dateTime.toISOString()}`}
                className={'py-5 max-w-80 shrink-0'}
              >
                <div className="flex flex-col gap-2">
                  <Skeleton className='w-77 h-35 shrink-0' />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
