import { useEffect, useState } from "react";

const TICK_MS = 250;

/**
 * Seconds left until `endsAt` (server epoch ms), corrected by the
 * server-client clock offset. `null` when there is no timer.
 */
export function useCountdown(endsAt: number | null, clockOffset: number): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (endsAt === null) return;
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, [endsAt]);

  if (endsAt === null) return null;
  return Math.max(0, Math.ceil((endsAt - (now + clockOffset)) / 1000));
}

export const formatClock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
