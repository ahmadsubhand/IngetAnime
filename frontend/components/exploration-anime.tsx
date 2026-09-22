import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { Clock, Plus, Star, Upload } from "lucide-react";
import { cn } from "../lib/utils";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { MalAnime } from '../types/my-anime-list.model';
import { Anime } from '../types/anime.model';
import type { AnimePlatform } from '../types/anime-platform.model';
import { UserAnimeList } from '../types/user-anime-list.model';
import dayjs from 'dayjs';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Skeleton } from './ui/skeleton';

export function ExplorationAnime({ 
  anime
}: { 
  anime: (MalAnime & Anime & {
    animePlatforms: AnimePlatform[];
    userAnimeList: UserAnimeList | null;
  })
}) {
  const episodeAired = anime.animePlatforms[0]?.episodeAired ?? 
    (anime.status === 'finished_airing' ? anime.episodeTotal : null);

  return (
    <Card className="flex flex-row p-0 gap-0 rounded-lg">
      <div className="w-30 sm:w-43 h-40 sm:h-60 relative">
        <Image
          src={anime.picture}
          alt={anime.title}
          sizes="120px"
          loading={"lazy"}
          className='object-cover'
          fill
        />
        {anime.mean && 
          <div className="hidden sm:block absolute bottom-0">
            <AnimeScore malId={anime.malId} score={anime.mean} />
          </div>
        }
        <div className="sm:block absolute top-0">
          <AnimeList userAnimeList={anime.userAnimeList} />
        </div>
      </div>
      <div className="flex flex-col pl-3 pt-1.5 pb-2 pr-2 w-50 sm:w-60 h-40 sm:h-60 justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-bold line-clamp-2">{anime.title}</p>
          <p className="hidden sm:block text-xs">
            {[
              anime.releaseAt && dayjs(anime.releaseAt).format('MMM DD, YYYY'),
              anime.episodeTotal && `${anime.episodeTotal} eps${anime.average_episode_duration ? `, ${Math.floor(anime.average_episode_duration / 60)} min` : ''}`,
            ]
              .filter(Boolean)
              .join(' -- ')}
          </p>
        </div>
        <ScrollArea className="hidden sm:flex text-xs max-h-20">
          <p>{anime.synopsis}</p>
        </ScrollArea>
        <ScrollArea>
          <p className="text-xs flex items-center">
            <span className="mr-1">Genre:</span>
            {anime.genres?.map((genre, i) => (
              <span key={genre.id} className='flex mr-1'>
                <Link
                  target={'_blank'}
                  href={`https://myanimelist.net/anime/genre/${genre.id}`}
                  className={cn(
                    buttonVariants({
                      variant: "link",
                      size: "xs",
                      class: "px-0 h-fit text-xs",
                    }),
                  )}
                >
                  {genre.name}
                </Link>

                {i < (anime.genres?.length ?? 0) - 1 && ", "}
              </span>
            ))}
          </p>
        </ScrollArea>

        {/* Mobile */}
        <ScrollArea className="sm:hidden">
          <AnimePlatform />
        </ScrollArea>
        <div className="flex justify-between sm:hidden">
          {anime.mean && <AnimeScore malId={anime.malId} score={anime.mean} />}
          {episodeAired && <AnimeEpisodeAired episodeAired={episodeAired} />}
        </div>

        {/* Dekstop */}
        <div className="hidden sm:flex justify-between items-end">
          <ScrollArea className={`hidden sm:flex${episodeAired ? ' max-w-40' : ''}`}>
            <AnimePlatform />
          </ScrollArea>
          {episodeAired && <AnimeEpisodeAired episodeAired={episodeAired} />}
        </div>
      </div>
    </Card>
  );
}

export function SkeletonAnime() {
  return (
    <Card className="flex flex-row p-0 gap-0 rounded-lg">
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
  )
}

function AnimePlatform() {
  return (
    <ul className="flex w-max gap-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <li className="h-5 w-5 relative" key={i}>
          <Image
            src={"/platform.png"}
            alt="Gambar platform contoh"
            sizes="20px"
            className='object-contain'
            fill
          />
        </li>
      ))}
    </ul>
  );
}

function AnimeScore({ malId, score }: { malId: number, score: number }) {
  return (
    <Tooltip>
      <TooltipTrigger render={
        <Link
          href={`https://myanimelist.net/anime/${malId}`}
          className={cn(
            buttonVariants({
              size: "xs",
            }),
          )}
          target={'_blank'}
        >
          <Star data-icon="inline-start" />
          {score}
        </Link>
      } />
      <TooltipContent>
        Lihat detail lebih lengkap di MyAnimeList
      </TooltipContent>
    </Tooltip>
  );
}

function AnimeEpisodeAired({ 
  episodeAired 
}: { 
  episodeAired: number 
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={
        <Button size={"xs"}>
          <Upload data-icon="inline-start" /> {episodeAired}
        </Button>
      } />
      <TooltipContent>
        Episode {episodeAired} sudah tayang
      </TooltipContent>
    </Tooltip>
  );
}

function AnimeList({ userAnimeList }: { userAnimeList: UserAnimeList | null }) {
  return userAnimeList ? (
    <Tooltip>
      <TooltipTrigger render={
        <Button size={"xs"}>
          <Clock data-icon="inline-start" />
          {userAnimeList.remainingWatchableEpisodes || '?'}
        </Button>
      } />
      <TooltipContent>
        {
          !userAnimeList.remainingWatchableEpisodes ? `Episode yang belum ditonton belum bisa dihitung` : 
          userAnimeList.remainingWatchableEpisodes < 0 ? `Ada ${userAnimeList.remainingWatchableEpisodes} episode ditonton lebih awal` : 
          userAnimeList.remainingWatchableEpisodes > 0 ? `Ada ${userAnimeList.remainingWatchableEpisodes} episode yang belum ditonton` :
          `Sudah menonton semua episode terbaru`
        }
      </TooltipContent>
    </Tooltip>
  ) : (
    <Tooltip>
      <TooltipTrigger render={
        <Button size={'xs'}>
          <Plus />
        </Button>
      } />
      <TooltipContent>
        Tambah ke list saya
      </TooltipContent>
    </Tooltip>
  )
}