"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function useCountdown(targetIso: string) {
  const [parts, setParts] = useState({ h: "00", m: "00", s: "00", done: false });

  useEffect(() => {
    const target = new Date(targetIso).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      if (diff === 0) {
        setParts({ h: "00", m: "00", s: "00", done: true });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setParts({ h: pad(h), m: pad(m), s: pad(s), done: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  return parts;
}
