import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

const mediaQuery = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

export function useIsMobile() {
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
