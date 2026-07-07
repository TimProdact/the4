"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { DropSnapshot } from "@/lib/api";
import { computePhase } from "@/lib/drop-config";
import { useDropStream } from "@/hooks/use-drop-stream";
import { useNow } from "@/hooks/use-now";
import { PreDropScreen } from "./pre-drop-screen";
import { SoldOutScreen } from "./sold-out-screen";
import { ActiveDropScreen } from "./active-drop-screen";

interface DropAppProps {
  initial: DropSnapshot;
}

export function DropApp({ initial }: DropAppProps) {
  const params = useSearchParams();
  const [vip, setVip] = useState(false);
  const snap = useDropStream(initial);
  const now = useNow(1000);

  const prefill = {
    name: params.get("name") || undefined,
    phone: params.get("phone") || undefined,
  };

  const phase = computePhase(snap.stock, vip, now);

  if (phase === "pre_drop") {
    return (
      <PreDropScreen
        startsAt={snap.startsAt}
        onVipUnlock={() => setVip(true)}
        onTimerDone={() => {}}
      />
    );
  }

  if (phase === "sold_out") {
    return <SoldOutScreen images={snap.images} />;
  }

  return <ActiveDropScreen snap={{ ...snap, phase, available: snap.available }} prefill={prefill} />;
}
