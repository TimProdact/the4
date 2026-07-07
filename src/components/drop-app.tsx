"use client";

import { useEffect, useState } from "react";
import type { DropSnapshot } from "@/lib/api";
import { DROP_THEMES, applyTheme } from "@/lib/drop-themes";
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

function readPrefill() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    name: p.get("name") || undefined,
    phone: p.get("phone") || undefined,
  };
}

export function DropApp({ initial }: DropAppProps) {
  const [vip, setVip] = useState(false);
  const [dropStarted, setDropStarted] = useState(false);
  const [prefill, setPrefill] = useState<{ name?: string; phone?: string }>({});
  const snap = useDropStream(initial);
  const now = useNow(1000);

  useEffect(() => {
    applyTheme(DROP_THEMES[0]);
    setVip(sessionStorage.getItem(VIP_KEY) === "1");
    setPrefill(readPrefill());
  }, []);

  useEffect(() => {
    if (now < new Date(snap.startsAt).getTime()) {
      setDropStarted(false);
    }
  }, [snap.startsAt, now]);

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
