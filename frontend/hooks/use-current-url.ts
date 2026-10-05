import { usePathname, useSearchParams } from 'next/navigation';

export function useCurrentUrl() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}
