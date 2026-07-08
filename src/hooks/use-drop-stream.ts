"use client";

import { useEffect, useState } from "react";
import type { DropSnapshot } from "@/lib/api";
import { subscribeDrop } from "@/lib/client-store";
import { fetchRemoteDrop, remoteDropEnabled } from "@/lib/remote-drop-api";

export function useDropStream(initial: DropSnapshot) {
  const [snap, setSnap] = useState(initial);

  useEffect(() => {
    if (!remoteDropEnabled()) {
      return subscribeDrop(setSnap);
    }

    let cancelled = false;
    const load = async () => {
      const remote = await fetchRemoteDrop();
      if (!cancelled && remote) setSnap(remote);
    };

    load();
    const id = window.setInterval(load, 12_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return snap;
}
