"use client";

import { useEffect, useState } from "react";
import type { DropSnapshot } from "@/lib/api";
import { subscribeDrop } from "@/lib/client-store";
import { fetchRemoteDrop, readDropIdFromLocation, remoteDropEnabled } from "@/lib/remote-drop-api";

export function useDropStream(initial: DropSnapshot, dropId?: string | null) {
  const [snap, setSnap] = useState(initial);

  useEffect(() => {
    const id = dropId ?? readDropIdFromLocation();
    if (!remoteDropEnabled()) {
      return subscribeDrop(setSnap);
    }

    let cancelled = false;
    const load = async () => {
      const remote = await fetchRemoteDrop(false, id);
      if (!cancelled && remote) setSnap(remote);
    };

    load();
    const timer = window.setInterval(load, 12_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [dropId]);

  return snap;
}
