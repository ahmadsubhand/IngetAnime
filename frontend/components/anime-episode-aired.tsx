import { buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AnimeStatus } from '@/enums';
import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import Link from 'next/link';

export default function AnimeEpisodeAired({
  episodeAired,
  status,
  firstAnimePlatformLink,
}: {
  episodeAired: number;
  status: AnimeStatus;
  firstAnimePlatformLink?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            href={firstAnimePlatformLink || ''}
            target={firstAnimePlatformLink ? '_blank' : '_self'}
            className={cn(
              buttonVariants({
                size: 'xs',
                variant:
                  status === 'finished_airing'
                    ? 'blue'
                    : status === 'currently_airing'
                      ? 'default'
                      : 'gray',
              }),
            )}
          >
            <Upload data-icon="inline-start" /> {episodeAired}
          </Link>
        }
      />
      <TooltipContent>Episode {episodeAired} sudah tayang</TooltipContent>
    </Tooltip>
  );
}
