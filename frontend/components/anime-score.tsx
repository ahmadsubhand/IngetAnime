import { buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Star } from 'lucide-react';
import Link from 'next/link';

export default function AnimeScore({
  malId,
  score,
  scoreSource = 'myanimelist',
}: {
  malId: number;
  score?: number;
  scoreSource?: 'myanimelist' | 'user';
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={`https://myanimelist.net/anime/${malId}`}
            className={cn(
              buttonVariants({
                size: 'xs',
                variant: !score
                  ? 'gray'
                  : score < 6
                    ? 'red'
                    : score < 8
                      ? 'yellow'
                      : 'default',
              }),
            )}
            target={'_blank'}
          >
            <Star data-icon="inline-start" />
            {score || '?'}
          </Link>
        }
      />
      <TooltipContent>
        {scoreSource === 'myanimelist'
          ? 'Lihat detail lebih lengkap di MyAnimeList'
          : score
            ? `Anda memberikan ${score}/10 untuk anime ini`
            : 'Anda belum memberikan skor'}
      </TooltipContent>
    </Tooltip>
  );
}
