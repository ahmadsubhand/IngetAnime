import Image from 'next/image';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MalAnime } from '@/types/my-anime-list.model';
import { Anime } from '@/types/anime.model';
import type { AnimePlatform as AnimePlatformType } from '@/types/anime-platform.model';
import AnimePlatform from '@/components/anime-platform';
import { UserAnimeList } from '@/types/user-anime-list.model';
import dayjs from 'dayjs';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import AnimeList from '@/components/anime-list';
import getEpisodeAired from '@/helper/get-episode-aired';
import AnimeScore from '@/components/anime-score';
import AnimeEpisodeAired from '@/components/anime-episode-aired';

export function ExplorationAnime({
  anime,
}: {
  anime: MalAnime &
    Anime & {
      animePlatforms: AnimePlatformType[];
      userAnimeList?: UserAnimeList | null;
    };
}) {
  const episodeAired = getEpisodeAired(
    anime.status,
    anime.episodeTotal,
    anime.animePlatforms[0],
  );
  const isMobile = useIsMobile();

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
        {anime.mean && (
          <div className="hidden sm:block absolute -bottom-px -left-px">
            <AnimeScore
              malId={anime.malId}
              score={anime.mean}
              scoreSource="myanimelist"
            />
          </div>
        )}
        <div className="sm:block absolute -top-px -left-px">
          <AnimeList anime={anime} />
        </div>
      </div>
      <div className="flex flex-col pl-3 pt-1.5 pb-2 pr-2 w-50 sm:w-60 h-40 sm:h-60 justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-bold line-clamp-2">{anime.title}</p>
          <p className="hidden sm:block text-xs">
            {[
              anime.releaseAt && dayjs(anime.releaseAt).format('MMM DD, YYYY'),
              anime.episodeTotal &&
                `${anime.episodeTotal} eps${anime.average_episode_duration ? `, ${Math.floor(anime.average_episode_duration / 60)} min` : ''}`,
            ]
              .filter(Boolean)
              .join(' -- ')}
          </p>
        </div>
        <ScrollArea className="hidden sm:flex text-xs max-h-20">
          <p>{anime.synopsis}</p>
        </ScrollArea>
        <ScrollArea>
          <p
            className={`text-xs flex items-center flex-wrap ${
              isMobile && anime.animePlatforms[0]?.id
                ? 'max-h-5'
                : !isMobile &&
                    (episodeAired !== null || anime.animePlatforms[0]?.id)
                  ? 'max-h-9'
                  : 'max-h-14'
            }`}
          >
            <span className="mr-1">Genre:</span>
            {anime.genres?.map((genre, i) => (
              <span key={genre.id} className="flex mr-1">
                <Link
                  target={'_blank'}
                  href={`https://myanimelist.net/anime/genre/${genre.id}`}
                  className={cn(
                    buttonVariants({
                      variant: 'link',
                      size: 'xs',
                      class: 'px-0 h-fit text-xs',
                    }),
                  )}
                >
                  {genre.name}
                </Link>

                {i < (anime.genres?.length ?? 0) - 1 && ', '}
              </span>
            ))}
          </p>
        </ScrollArea>

        {/* Mobile */}
        {anime.animePlatforms[0]?.id && (
          <ScrollArea className="sm:hidden">
            <AnimePlatform platforms={anime.animePlatforms} />
          </ScrollArea>
        )}
        <div className="flex justify-between sm:hidden">
          {anime.mean && <AnimeScore malId={anime.malId} score={anime.mean} scoreSource='myanimelist' />}
          {episodeAired && (
            <AnimeEpisodeAired
              episodeAired={episodeAired}
              status={anime.status}
              firstAnimePlatformLink={anime.animePlatforms[0]?.link.url}
            />
          )}
        </div>

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
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="hidden sm:block h-4 w-full" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="hidden sm:block h-4 w-full" />
          <Skeleton className="hidden sm:block h-4 w-1/2" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="flex sm:hidden justify-between">
          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-5 w-10" />
        </div>
      </div>
    </Card>
  );
}
