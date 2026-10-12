import HomeSection from '@/app/section';
import AppLogo from '@/components/app-logo';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function IntegrationHome() {
  return (
    <HomeSection
      id="integration-section"
      className="flex flex-col justify-center items-center gap-10"
    >
      <div className="w-full md:w-fit flex gap-5 md:gap-10 lg:gap-12 xl:gap-20 items-center justify-between md:jutify-center">
        <AppLogo className="text-3xl md:text-5xl lg:text-6xl xl:text-8xl" />

        <RefreshCw className="size-10 lg:size-12 xl:size-20" />

        <Link
          className="relative w-15 md:w-22 lg:w-30 xl:w-45 h-15 md:h-22 lg:h-30 xl:h-45"
          target={'_blank'}
          href={
            'https://myanimelist.net/?utm_source=ingetanime&utm_medium=referral&utm_campaign=mal_integration'
          }
        >
          <Image
            src={'/mal.png'}
            alt="MyAnimeList"
            fill
            className="object-contain"
            sizes="256px"
            loading={'eager'}
          />
        </Link>
      </div>

      <p className="text-base lg:text-xl xl:text-2xl text-center">
        Anime terbaik? Anime musiman? Info lengkap anime? Status anime kamu?{' '}
        <br />
        Semuanya terintegrasi dengan MyAnimeList!
      </p>

      <Link
        href={'/anime/exploration'}
        className={cn(buttonVariants({ className: 'w-fit' }))}
      >
        <ArrowRight />
        Cek eksplorasi sekarang!
      </Link>
    </HomeSection>
  );
}