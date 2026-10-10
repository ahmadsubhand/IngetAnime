import * as React from 'react';

export function useIsMobile(breakPoint: number | undefined = 768) {
  const mediaQuery = `(max-width: ${breakPoint - 1}px)`;

  return React.useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia(mediaQuery);

      mql.addEventListener('change', callback);

      return () => {
        mql.removeEventListener('change', callback);
      };
    },
    () => window.matchMedia(mediaQuery).matches,
    () => false,
  );
}
