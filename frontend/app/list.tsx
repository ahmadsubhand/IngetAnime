import { AnimeDailyTimeline } from '@/types/anime-exploration.model';
import Image from 'next/image';
import dayjs from 'dayjs';
import locale_id from 'dayjs/locale/id';
import { Card } from '@/components/ui/card';
import TimelineDay from '@/app/timeline/timeline';

dayjs.locale(locale_id);

interface ImageType {
  src: string;
  alt: string;
  fullSizes: number;
  displayWidth: number;
  displayHeight: number;
}

export function PlatformList() {
  const platforms: ImageType[] = [
    {
      src: 'bstation.png',
      alt: 'Bstation',
      fullSizes: 1528,
      displayWidth: 25,
      displayHeight: 24,
    },
    {
      src: 'crunchyroll.svg',
      alt: 'Crunchyroll',
      fullSizes: 48,
      displayWidth: 24,
      displayHeight: 24,
    },
    {
      src: 'anione.png',
      alt: 'YouTube - AniOne',
      fullSizes: 1043,
      displayWidth: 24,
      displayHeight: 24,
    },
    {
      src: 'muse.jpg',
      alt: 'YouTube - Muse',
      fullSizes: 900,
      displayWidth: 24,
      displayHeight: 24,
    },
    {
      src: 'iqiyi.svg',
      alt: 'iQiyi',
      fullSizes: 2500,
      displayWidth: 28,
      displayHeight: 24,
    },
    {
      src: 'netflix.png',
      alt: 'Netflix',
      fullSizes: 1128,
      displayWidth: 13,
      displayHeight: 24,
    },
    {
      src: 'catchplay.png',
      alt: 'Catchplay',
      fullSizes: 512,
      displayWidth: 24,
      displayHeight: 24,
    },
    {
      src: 'disney.svg',
      alt: 'Disney+',
      fullSizes: 1033,
      displayWidth: 44,
      displayHeight: 24,
    },
    {
      src: 'prime.svg',
      alt: 'Prime Video',
      fullSizes: 1528,
      displayWidth: 24,
      displayHeight: 24,
    },
  ];
  return (
    <div className="flex gap-4">
      {platforms.map((platform, index) => (
        <div
          key={index}
          className={`relative ${index > 4 ? 'hidden md:block' : ''}`}
          style={{
            width: platform.displayWidth,
            height: platform.displayHeight,
          }}
        >
          <Image
            src={`/platforms/${platform.src}`}
            alt={platform.alt}
            sizes={`${platform.fullSizes}px`}
            className="object-contain"
            fill
          />
        </div>
      ))}
    </div>
  );
}

export function AnimeList() {
  const animes: (ImageType & { platform: ImageType })[] = [
    {
      src: '151547l.jpg',
      alt: 'Gintama',
      fullSizes: 425,
      displayWidth: 85,
      displayHeight: 120,
      platform: {
        src: 'anione.png',
        alt: 'YouTube - AniOne',
        fullSizes: 1043,
        displayWidth: 12,
        displayHeight: 12,
      },
    },
    {
      src: '151793l.jpg',
      alt: 'Spy x Family',
      fullSizes: 424,
      displayWidth: 85,
      displayHeight: 120,
      platform: {
        src: 'bstation.png',
        alt: 'Bstation',
        fullSizes: 1528,
        displayWidth: 13,
        displayHeight: 12,
      },
    },
    {
      src: '152271l.jpg',
      alt: 'Aruhime',
      fullSizes: 337,
      displayWidth: 85,
      displayHeight: 120,
      platform: {
        src: 'muse.jpg',
        alt: 'YouTube - Muse',
        fullSizes: 900,
        displayWidth: 12,
        displayHeight: 12,
      },
    },
    {
      src: '152280l.jpg',
      alt: 'Uma Musume',
      fullSizes: 424,
      displayWidth: 85,
      displayHeight: 120,
      platform: {
        src: 'netflix.png',
        alt: 'Netflix',
        fullSizes: 1128,
        displayWidth: 6,
        displayHeight: 12,
      },
    },
    {
      src: '152352l.jpg',
      alt: 'Gnosia',
      fullSizes: 415,
      displayWidth: 85,
      displayHeight: 120,
      platform: {
        src: 'crunchyroll.svg',
        alt: 'Crunchyroll',
        fullSizes: 48,
        displayWidth: 12,
        displayHeight: 12,
      },
    },
  ];

  return (
    <div className="flex gap-6 h-37">
      {animes.map((anime, index) => (
        <div
          className={`${index === 0 || index > 3 ? 'hidden md:flex' : 'flex'} ${
            index > 3 ? 'md:hidden xl:flex' : ''
          } h-full even:items-start odd:items-end`}
          key={index}
        >
          <div
            style={{
              position: 'relative',
              width: anime.displayWidth,
              height: anime.displayHeight,
            }}
          >
            <Image
              src={`/anime/${anime.src}`}
              alt={anime.alt}
              sizes={`${anime.fullSizes}px`}
              className="object-cover"
              fill
            />

            <div
              style={{
                position: 'absolute',
                bottom: 3,
                right: 3,
                width: anime.platform.displayWidth,
                height: anime.platform.displayHeight,
                zIndex: 5,
              }}
            >
              <Image
                src={`/platforms/${anime.platform.src}`}
                alt={anime.platform.alt}
                sizes={`${anime.platform.fullSizes}px`}
                className="object-contain"
                fill
              />
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: -17.5,
                right: -14.5,
                width: 55,
                height: 61,
              }}
            >
              <Image
                src={`/platform-surface.svg`}
                alt={'Platform Surface'}
                sizes={`60px`}
                className="object-contain"
                fill
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const dailyTimelineDummy: AnimeDailyTimeline = {
  dateTime: dayjs().startOf('day').toISOString(),
  timelines: [
    {
      dateTime: dayjs().hour(0).minute(5).toISOString(),
      anime: [
        {
          schedule: {
            dateTime: dayjs().hour(0).minute(5).toISOString(),
            episodeNumber: 4,
          },
          id: 1811,
          malId: 54757,
          updatedAt: '2026-10-03T01:37:56.105Z',
          picture: '/anime/151547l.jpg',
          title: '3-nen Z-gumi Ginpachi-sensei',
          titleID: null,
          titleEN: "Gintama - Mr. Ginpachi's Zany Class",
          releaseAt: '2025-10-07',
          episodeTotal: 12,
          status: 'currently_airing',
          animePlatforms: [
            {
              id: 1,
              animeId: 1811,
              platformId: 1,
              linkId: 1,
              accessType: 'free',
              nextEpisodeAiringAt: dayjs()
                .hour(0)
                .minute(5)
                .add(7, 'day')
                .toISOString(),
              lastEpisodeAiredAt: dayjs().hour(0).minute(5).toISOString(),
              intervalInDays: 7,
              episodeAired: 4,
              isMainPlatform: false,
              isHiatus: false,
              platform: {
                id: 1,
                name: 'Bstation',
                icon: '/uploads/platforms/Bstation.png',
                width: 1000,
                height: 937,
                ratio: 1.067235859124867,
              },
              link: {
                id: 1,
                platformId: 1,
                url: 'https://www.bilibili.tv/id/play/2432099',
              },
            },
            {
              id: 2,
              animeId: 1811,
              platformId: 2,
              linkId: 2,
              accessType: 'free',
              nextEpisodeAiringAt: dayjs()
                .hour(0)
                .minute(5)
                .add(7, 'day')
                .toISOString(),
              lastEpisodeAiredAt: dayjs().hour(0).minute(5).toISOString(),
              intervalInDays: 7,
              episodeAired: 4,
              isMainPlatform: false,
              isHiatus: false,
              platform: {
                id: 2,
                name: 'YouTube - AniOne Indonesia',
                icon: '/uploads/platforms/YouTube - AniOne Indonesia.png',
                width: 1043,
                height: 1042,
                ratio: 1.000959692898272,
              },
              link: {
                id: 2,
                platformId: 2,
                url: 'https://www.bilibili.tv/id/play/2432099',
              },
            },
            {
              id: 3,
              animeId: 1811,
              platformId: 3,
              linkId: 3,
              accessType: 'free',
              nextEpisodeAiringAt: dayjs()
                .hour(0)
                .minute(5)
                .add(7, 'day')
                .toISOString(),
              lastEpisodeAiredAt: dayjs().hour(0).minute(5).toISOString(),
              intervalInDays: 7,
              episodeAired: 4,
              isMainPlatform: false,
              isHiatus: false,
              platform: {
                id: 3,
                name: 'Crunchyroll',
                icon: '/uploads/platforms/Crunchyrolll.svg',
                width: 48,
                height: 48,
                ratio: 1,
              },
              link: {
                id: 3,
                platformId: 3,
                url: 'https://www.bilibili.tv/id/play/2432099',
              },
            },
            {
              id: 4,
              animeId: 1811,
              platformId: 4,
              linkId: 4,
              accessType: 'free',
              nextEpisodeAiringAt: dayjs()
                .hour(0)
                .minute(5)
                .add(7, 'day')
                .toISOString(),
              lastEpisodeAiredAt: dayjs().hour(0).minute(5).toISOString(),
              intervalInDays: 7,
              episodeAired: 4,
              isMainPlatform: false,
              isHiatus: false,
              platform: {
                id: 4,
                name: 'YouTube - Muse Indonesia',
                icon: '/uploads/platforms/YouTube - Muse Indonesia.jpg',
                width: 900,
                height: 900,
                ratio: 1,
              },
              link: {
                id: 4,
                platformId: 4,
                url: 'https://www.bilibili.tv/id/play/2432099',
              },
            },
          ],
        },
      ],
    },
    {
      dateTime: dayjs().hour(21).minute(30).toISOString(),
      anime: [
        {
          schedule: {
            dateTime: dayjs().hour(21).minute(30).toISOString(),
            episodeNumber: 4,
          },
          id: 1716,
          malId: 59027,
          updatedAt: '2026-10-03T01:37:56.105Z',
          picture: '/anime/151793l.jpg',
          title: 'Spy x Family Season 3',
          titleID: null,
          titleEN: 'Spy x Family Season 3',
          releaseAt: '2025-10-04',
          episodeTotal: 13,
          status: 'currently_airing',
          animePlatforms: [
            {
              id: 2,
              animeId: 1716,
              platformId: 1,
              linkId: 5,
              accessType: 'free',
              nextEpisodeAiringAt: dayjs().hour(21).minute(30).toISOString(),
              lastEpisodeAiredAt: dayjs()
                .hour(23)
                .minute(30)
                .subtract(7, 'day')
                .toISOString(),
              intervalInDays: 7,
              episodeAired: 4,
              isMainPlatform: false,
              isHiatus: false,
              platform: {
                id: 1,
                name: 'Bstation',
                icon: '/uploads/platforms/Bstation.png',
                width: 1000,
                height: 937,
                ratio: 1.067235859124867,
              },
              link: {
                id: 5,
                platformId: 1,
                url: 'https://www.bilibili.tv/id/play/2432099',
              },
            },
          ],
        },
      ],
    },
  ],
};
export function TimelineList({ className = '' }: { className?: string }) {
  return (
    <div
      inert
      className={`max-h-100 md:h-fit relative overflow-hidden p-1 pointer-events-none ${className}`}
    >
      <Card className="p-5">
        <div className="flex flex-col gap-1 w-full text-center mb-2 select-none">
          <span className="font-bold tracking-wide">Hari ini</span>
          <span>{dayjs().format('dddd')}</span>
        </div>
        <TimelineDay dailyTimeline={dailyTimelineDummy} isDisplay />
      </Card>
      <div className="absolute bottom-0 left-0 bg-linear-to-b to-background w-full h-25" />
    </div>
  );
}