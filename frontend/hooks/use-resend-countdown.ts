import { useCallback, useEffect, useState } from "react";

export function useResendCountdown(
  expiryTimeInSeconds = 60,
  storageKey = "resendExpireAt",
) {
  const getRemainingSeconds = useCallback(() => {
    if (typeof window === "undefined") {
      return 0;
    }

    const expireAt = Number(
      localStorage.getItem(storageKey) || "0",
    );

    return Math.max(
      0,
      Math.ceil((expireAt - Date.now()) / 1000),
    );
  }, [storageKey]);

  const [seconds, setSeconds] = useState(getRemainingSeconds);

  const canResend = seconds <= 0;

  useEffect(() => {
    if (seconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds(getRemainingSeconds());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [seconds, getRemainingSeconds]);

  const start = useCallback(() => {
    const expireAt =
      Date.now() + expiryTimeInSeconds * 1000;

    localStorage.setItem(
      storageKey,
      String(expireAt),
    );

    setSeconds(expiryTimeInSeconds);
  }, [expiryTimeInSeconds, storageKey]);

  return {
    seconds,
    canResend,
    start,
  };
}