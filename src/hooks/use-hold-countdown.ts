"use client";

import { useEffect, useState } from "react";

export function useHoldCountdown(expiresAt: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!expiresAt) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  const leftMs = expiresAt ? Math.max(0, expiresAt - now) : 0;
  const expired = expiresAt !== null && now >= expiresAt;
  const totalSec = Math.ceil(leftMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;

  return {
    expired,
    label: `${min}:${sec.toString().padStart(2, "0")}`,
    leftMs,
  };
}
