import { useState, useEffect } from 'react';

interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function calc(target: Date): Countdown {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1_000);
  return { days, hours, minutes, seconds, isExpired: false };
}

export function useCountdown(targetDate: Date): Countdown {
  const [state, setState] = useState<Countdown>(() => calc(targetDate));

  useEffect(() => {
    const id = setInterval(() => setState(calc(targetDate)), 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  return state;
}
