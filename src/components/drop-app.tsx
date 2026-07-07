"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { DropSnapshot } from "@/lib/api";
import { computePhase } from "@/lib/drop-config";
import { useDropStream } from "@/hooks/use-drop-stream";
import { useNow } from "@/hooks/use-now";
import { PreDropScreen } from "./pre-drop-screen";
import { SoldOutScreen } from "./sold-out-screen";
import { ActiveDropScreen } from "./active-drop-screen";
import { PausedScreen } from "./paused-screen";

interface DropAppProps {
  initial: DropSnapshot;
}

const VIP_KEY = "the4_vip";

export function DropApp({ initial }: DropAppProps) {
  const params = useSearchParams();
  const [vip, setVip] = useState(false);
  const [dropStarted, setDropStarted] = useState(false);
  const snap = useDropStream(initial);
  const now = useNow(1000);

  useEffect(() => {
    setVip(sessionStorage.getItem(VIP_KEY) === "1");
  }, []);

  useEffect(() => {
    if (now < new Date(snap.startsAt).getTime()) {
      setDropStarted(false);
    }
  }, [snap.startsAt, now]);

  const prefill = {
    name: params.get("name") || undefined,
    phone: params.get("phone") || undefined,
  };

  if (snap.paused) {
    return <PausedScreen />;
  }

  const timedPhase = dropStarted
    ? snap.stock <= 0
      ? "sold_out"
      : "active"
    : computePhase(snap.stock, vip, now, snap.startsAt);

  if (timedPhase === "pre_drop") {
    return (
      <PreDropScreen
        startsAt={snap.startsAt}
        onVipUnlock={() => {
          sessionStorage.setItem(VIP_KEY, "1");
          setVip(true);
        }}
        onTimerDone={() => setDropStarted(true)}
      />
    );
  }

  if (timedPhase === "sold_out" || snap.stock <= 0) {
    return <SoldOutScreen />;
  }

  return (
    <ActiveDropScreen
      snap={{ ...snap, phase: "active", available: snap.available }}
      prefill={prefill}
    />
  );
}
