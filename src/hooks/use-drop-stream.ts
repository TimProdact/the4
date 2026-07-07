"use client";

import { useEffect, useState } from "react";
import type { DropSnapshot } from "@/lib/api";

export function useDropStream(initial: DropSnapshot) {
  const [snap, setSnap] = useState(initial);

  useEffect(() => {
    const es = new EventSource("/api/stock/stream");
    es.onmessage = e => {
      try {
        setSnap(JSON.parse(e.data));
      } catch {
        /* ignore */
      }
    };
    return () => es.close();
  }, []);

  return snap;
}
