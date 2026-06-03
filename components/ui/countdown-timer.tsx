"use client";

import { useEffect, useMemo, useState } from "react";

type CountdownTimerProps = {
  targetDateIso: string | null;
};

function formatRemaining(msRemaining: number): string {
  if (msRemaining <= 0) {
    return "00d 00h 00m 00s";
  }

  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(days).padStart(2, "0")}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

export function CountdownTimer({ targetDateIso }: CountdownTimerProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const label = useMemo(() => {
    if (!targetDateIso) {
      return "Sin deadline activo";
    }

    const target = new Date(targetDateIso).getTime();
    return formatRemaining(target - now);
  }, [targetDateIso, now]);

  return <span>{label}</span>;
}
