'use client';

import { ListAnime } from '@/app/anime/list/anime';
import AnimeEmpty from '@/components/anime-empty';
import AnimeUpdate from '@/components/anime-update';
import AppTitle from '@/components/app-title';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import usePlatforms from '@/hooks/use-platforms';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import userService from '@/services/user.service';
import { UserValidation } from '@/validator/user.validation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Compass, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

type Status =
  (typeof UserValidation.ListStatusFilter)[keyof typeof UserValidation.ListStatusFilter];
type Sort = (typeof UserValidation.Sort)[keyof typeof UserValidation.Sort];

export default function ListPage() {
  const isMobile = useIsMobile();
  const limit = isMobile ? 5 : 12;

  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!user?.isVerified) {
      router.replace('/auth');
    }
  }, [user, router]);

  const statusOptions = [
    { label: 'Semua', value: UserValidation.ListStatusFilter.all },
    { label: 'Berjalan', value: UserValidation.ListStatusFilter.watching },
    { label: 'Selesai', value: UserValidation.ListStatusFilter.completed },
    { label: 'Ditunda', value: UserValidation.ListStatusFilter.on_hold },
    { label: 'Ditinggalkan', value: UserValidation.ListStatusFilter.dropped },
    {
      label: 'Direncanakan',
      value: UserValidation.ListStatusFilter.plan_to_watch,
    },
  ];
  const [status, setStatus] = useState<Status>(
    UserValidation.ListStatusFilter.all,
  );

  const platformsFromDb = usePlatforms();
  const platformOptions = [{ label: 'Semua', value: 0 }].concat(
    platformsFromDb.map((platform) => {
      return {
        label: platform.name,
        value: platform.id,
      };
    }),
  );
  const [platformId, setPlatformId] = useState(0);

  const sortOptions = [
    { label: 'Judul', value: UserValidation.Sort.anime_title },
    { label: 'Skor', value: UserValidation.Sort.list_score },
    {
      label: 'Jumlah Belum Ditonton',
      value: UserValidation.Sort.remaining_watchable_episodes,
    },
    { label: 'Rilis Terbaru', value: UserValidation.Sort.anime_release_at },
    { label: 'Terakhir Diubah', value: UserValidation.Sort.list_updated_at },
    { label: 'ID', value: UserValidation.Sort.anime_id },
  ];
  const [sort, setSort] = useState<Sort>(UserValidation.Sort.anime_title);

  const {
    data,
    fetchNextPage,
    status: queryStatus,
    isFetchingNextPage,
    hasNextPage,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['anime', 'status', { status, sort, platformId }],
    initialPageParam: {
      limit,
      offset: 0,
    },
    queryFn: async ({ pageParam }) => {
      const response = await userService.getUserAnimeList({
        ...pageParam,
        status,
        sort,
        platformId: platformId || undefined,
      });
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
        title="List Anime Saya"
        subtitle="Kelola, pantau, dan simpan semua anime yang kamu tonton dalam satu tempat!"
      />

      <FieldGroup className="sm:flex-row gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
        <FieldWrap>
          <FieldLabel htmlFor="status" className='min-w-15 sm:min-w-fit'>Status</FieldLabel>
          <Select
            disabled={queryStatus === 'pending'}
            items={statusOptions}
            value={status}
            onValueChange={(value) =>
              setStatus(value ?? UserValidation.ListStatusFilter.all)
            }
          >
            <SelectTrigger className={`bg-background w-full`} id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                {statusOptions.map((option) => (
                  <SelectItem value={option.value} key={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FieldWrap>

        <FieldWrap>
          <FieldLabel htmlFor="platform" className='min-w-15 sm:min-w-fit'>Platform</FieldLabel>
          <Select
            disabled={queryStatus === 'pending'}
            items={platformOptions}
            value={platformId}
            onValueChange={(value) => setPlatformId(value || 0)}
          >
            <SelectTrigger className={`bg-background w-full`} id="platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Platform</SelectLabel>
                {platformOptions.map((option) => (
                  <SelectItem value={option.value} key={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FieldWrap>

        <FieldWrap>
          <FieldLabel htmlFor="sort" className='min-w-15 sm:min-w-fit'>Urutan</FieldLabel>
          <Select
            disabled={queryStatus === 'pending'}
            items={sortOptions}
            value={sort}
            onValueChange={(value) =>
              setSort(value ?? UserValidation.Sort.anime_title)
            }
          >
            <SelectTrigger className={`bg-background w-full`} id="sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Urutan</SelectLabel>
                {sortOptions.map((option) => (
                  <SelectItem value={option.value} key={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FieldWrap>
      </FieldGroup>

      <div
        className={`w-full flex sm:flex-wrap flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:justify-center ${animes.length < 1 && queryStatus === 'success' ? 'min-h-full' : ''}`}
      >
        {animes.map((anime) => (
          <ListAnime anime={anime} key={anime.id} />
        ))}
        {animes.length < 1 && queryStatus === 'success' && (
          <AnimeEmpty
            className="md:w-160"
            message={
              status === 'all' && platformId === 0
                ? 'Mulai simpan status anime supaya tidak kehilangan progres dan rencana menonton'
                : 'Tidak ditemukan list anime tersimpan. Silakan atur ulang kategori pencarian'
            }
            action={
              status === 'all' && platformId === 0 ? (
                <Link
                  href={`/anime/exploration`}
                  className={cn(buttonVariants())}
                >
                  <Compass />
                  Mulai Eksplorasi
                </Link>
              ) : (
                <Button
                  onClick={() => {
                    setStatus('all');
                    setPlatformId(0);
                  }}
                >
                  <RefreshCw />
                  Atur Ulang
                </Button>
              )
            }
            imageWithDiv={
              <div className="w-50 h-50 sm:h-53 relative">
                <Image
                  src={'/tohru.png'}
                  alt="Tohru"
                  fill
                  className="object-contain"
                  sizes="809px"
                  loading="eager"
                />
              </div>
            }
          />
        )}
        <div
          ref={ref}
          className="w-full flex sm:flex-wrap flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:justify-center"
        >
          {(queryStatus === 'pending' || isFetchingNextPage) &&
            Array.from({ length: isMobile ? 3 : 6 }).map((_, i) => (
              <div key={i} />
            ))}
        </div>
      </div>

      <AnimeUpdate isOpen={isRefetching} />

      <div className="hidden sm:block fixed w-95 h-229 -left-34 -bottom-65 -z-1">
        <Image
          src={'/sakura.webp'}
          alt="Haruka Sakura"
          fill
          className="object-contain"
          sizes="1000px"
          loading={'eager'}
        />
      </div>
      <div className="hidden sm:block fixed w-110 h-170 -right-43 -bottom-40 -z-1">
        <Image
          src={'/loid.png'}
          alt="Loid Forger"
          fill
          className="object-contain"
          sizes="568px"
          loading={'eager'}
        />
      </div>
    </>
  );
}

function FieldWrap({ children }: { children: ReactNode }) {
  return (
    <Field orientation={'horizontal'}>
      {children}
    </Field>
  )
}