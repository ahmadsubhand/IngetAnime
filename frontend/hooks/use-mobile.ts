import * as React from 'react';

export function useIsMobile(breakPoint: number | undefined = 640) {
  const mediaQuery = `(max-width: ${breakPoint}px)`;

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
