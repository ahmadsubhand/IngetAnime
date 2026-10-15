import { AnimeList, PlatformList, TimelineList } from '@/app/list';
import HomeSection from '@/app/section';
import AppLogo from '@/components/app-logo';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export default function HeroHome() {
  return (
    <HomeSection
      id="hero-section"
      className="flex justify-center lg:justify-between gap-10"
    >
      <div className="flex flex-col justify-between items-center md:items-start flex-1 max-w-130 lg:max-w-fit gap-8">
        <div className="flex flex-col gap-8 items-center md:items-start">
          <PlatformList />

          <p className="hidden md:block font-medium text-2xl tracking-widest">
            Mau nonton anime tapi bingung nonton dimana?
          </p>

          <div className="flex gap-10 items-center">
            <AppLogo className="text-6xl mb-2" />
            <div className="hidden md:flex flex-col gap-1 w-fit shrink-0 uppercase tex-lg font-bold tracking-[.25em]">
              <span className="w-fit">Eksplorasi</span>
              <span className="w-fit text-primary">Platform</span>
              <span className="w-fit">Anime</span>
            </div>
          </div>

          {/* Dekstop */}
          <p className="hidden md:block text-base max-w-129">
            Yuk cari tau disini. Mulai dari platform gratis, waktu terbatas,
            sampai berlangganan semuanya ada!
          </p>
        </div>

        <AnimeList />

        {/* Mobile */}
        <div className="flex md:hidden flex-col items-center gap-1 w-fit shrink-0 uppercase tex-lg font-bold tracking-[.25em]">
          <span className="w-fit">Eksplorasi</span>
          <span className="w-fit text-primary">Platform</span>
          <span className="w-fit">Anime</span>
        </div>

        <a
          href={'#timeline-section'}
          className={cn(
            buttonVariants({ className: 'md:hidden w-fit', variant: 'ghost' }),
          )}
        >
          <ChevronDown />
        </a>
      </div>

      <div className="hidden lg:flex flex-col items-end justify-between gap-8 flex-1 max-w-fit">
        <TimelineList className="max-h-90" />

        <p className="text-2xl max-w-125 text-right">
          Jadwal tayang anime dari berbagai platform cukup dalam satu timeline!
        </p>
      </div>
    </HomeSection>
  );
}
