"use client";

import { useEffect, useState } from "react";

function remaining(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
  };
}

/**
 * Countdown REAL contra la fecha de fin de la campaña (no se reinicia al
 * recargar). Se oculta solo cuando la campaña termina.
 */
export function CountdownTimer({
  endsAt,
  className = "",
  compact = false,
}: {
  endsAt: string;
  className?: string;
  compact?: boolean;
}) {
  const [time, setTime] = useState<ReturnType<typeof remaining>>(() => remaining(endsAt));

  useEffect(() => {
    const id = setInterval(() => setTime(remaining(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!time) return null;

  const parts = [
    ...(time.d > 0 ? [{ v: time.d, l: "d" }] : []),
    { v: time.h, l: "h" },
    { v: time.m, l: "m" },
    { v: time.s, l: "s" },
  ];

  if (compact) {
    return (
      <span className={`font-mono tabular-nums ${className}`}>
        {parts.map((p) => `${String(p.v).padStart(2, "0")}${p.l}`).join(" ")}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {parts.map((p, i) => (
        <div key={i} className="flex items-baseline gap-0.5">
          <span className="font-display font-bold tabular-nums bg-cream-900 text-white rounded-md px-1.5 py-0.5 text-sm min-w-[2ch] text-center">
            {String(p.v).padStart(2, "0")}
          </span>
          <span className="text-[10px] text-cream-500 uppercase">{p.l}</span>
        </div>
      ))}
    </div>
  );
}
