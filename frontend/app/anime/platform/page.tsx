'use client';

import AddPlatform from '@/app/anime/platform/add-platform';
import ListPlatform, {
  PlatformSkeleton,
} from '@/app/anime/platform/list-platform';
import AnimeEmpty from '@/components/anime-empty';
import AnimeUpdate from '@/components/anime-update';
import AppTitle from '@/components/app-title';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/providers/auth-provider';
import platformService from '@/services/platform.service';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ListPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.back();
    }
  }, [isAdmin]);

  const {
    data: platforms,
    isRefetching,
    status,
  } = useQuery({
    queryKey: ['anime', 'platform'],
    queryFn: async () => {
      const response = await platformService.getAllPlatform();
      return response.data;
    },
    staleTime: Infinity,
  });

  return (
    <>
      <AppTitle
        title="Kelola Platform"
        subtitle="Perbarui informasi seperti nama dan logo platform streaming disini!"
      />

      <AddPlatform />

      <div
        className={`w-full flex sm:flex-wrap flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:justify-center ${!platforms || platforms.length < 1 ? 'min-h-full' : ''}`}
      >
        {platforms &&
          status === 'success' &&
          platforms.map((platform) => (
            <ListPlatform platform={platform} key={platform.id} />
          ))}
        {(!platforms || platforms.length < 1) && status === 'success' && (
          <AnimeEmpty
            className="md:w-160"
            message="Belum ada platform tersedia. Tambah platform streaming sekarang"
            action={
              <Button>
                <RefreshCw />
                Atur Ulang
              </Button>
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
        {status === 'pending' &&
          Array.from({ length: 8 }).map((_, i) => (
            <PlatformSkeleton key={i} className={i >= 3 ? 'hidden sm:flex' : ''} />
          ))}
      </div>

      <AnimeUpdate isOpen={isRefetching} />

      {/* <div className="hidden sm:block fixed w-95 h-229 -left-34 -bottom-65 -z-1">
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
      </div> */}
    </>
  );
}
