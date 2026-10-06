import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { AnimePlatform } from '@/types/anime-platform.model';
import Image from 'next/image';
import Link from 'next/link';

export default function AnimePlatform({
  platforms,
}: {
  platforms: AnimePlatform[];
}) {
  return (
    <div className="flex w-max gap-2">
      {platforms.map((platform) => (
        <Tooltip key={platform.id}>
          <TooltipTrigger
            render={
              <Link
                href={platform.link.url}
                target={'_blank'}
                className="w-5 h-5 relative"
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${platform.platform.icon}`}
                  alt={platform.platform.name}
                  sizes="20px"
                  className="object-contain"
                  fill
                />
              </Link>
            }
          />
          <TooltipContent>{platform.platform.name}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
