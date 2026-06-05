import { useState, useEffect } from 'react';

export function useUpsellTimer(durationSeconds: number = 12) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isExpired]);

  const percentageLeft = (timeLeft / durationSeconds) * 100;

  return {
    timeLeft,
    isExpired,
    percentageLeft,
  };
}
