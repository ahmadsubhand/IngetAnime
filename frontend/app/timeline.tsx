import { TimelineList } from '@/app/list';
import HomeSection from '@/app/section';
import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function TimelineHome() {
  return (
    <HomeSection
      id="timeline-section"
      className="flex flex-col-reverse md:flex-row justify-between lg:justify-center items-center gap-5"
    >
      <div className="flex flex-col gap-10 items-center md:items-start w-full md:max-w-55 xl:max-w-90">
        <Card className="px-4 py-4">
          <p className="text-center md:text-left text-base md:text-xl xl:text-2xl">
            Kamu bisa tahu dengan cepat jadwal tayang anime tanpa repot lagi
            buka banyak platform.
          </p>
        </Card>
        <Link
          href={'/anime/timeline'}
          className={cn(buttonVariants({ className: 'w-fit' }))}
        >
          <ArrowRight />
          Cek timeline sekarang!
        </Link>
      </div>

      <div className="w-80 h-118 overflow-hidden hidden lg:flex items-center justify-center">
        <div className="relative w-140 xl:w-160 h-236 shrink-0">
          <Image
            src={'/rikka.jpg'}
            alt="Rikka Takanashi"
            fill
            className="object-contain"
            sizes="2560px"
            loading={'eager'}
          />
        </div>
      </div>

      <TimelineList />
    </HomeSection>
  );
}
