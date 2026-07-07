"use client";

import { useEffect, useState } from "react";
import type { DropSnapshot } from "@/lib/api";
import { DROP_THEMES, type DropTheme } from "@/lib/drop-themes";
import { computePhase } from "@/lib/drop-config";
import { checkoutPreviewStep, readPreviewParams, type DropPreview } from "@/lib/preview";
import { ThemeProvider } from "@/lib/theme-context";
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

function DropAppInner({
  initial,
  preview,
}: {
  initial: DropSnapshot;
  preview: DropPreview | null;
}) {
  const [vip, setVip] = useState(false);
  const [dropStarted, setDropStarted] = useState(false);
  const [prefill, setPrefill] = useState<{ name?: string; phone?: string }>({});
  const snap = useDropStream(initial);
  const now = useNow(1000);

  useEffect(() => {
    setVip(sessionStorage.getItem(VIP_KEY) === "1");
    setPrefill(readPrefill());
    if (preview === "active" || preview?.startsWith("checkout_")) {
      setDropStarted(true);
    }
  }, [preview]);

  useEffect(() => {
    if (now < new Date(snap.startsAt).getTime()) {
      setDropStarted(false);
    }
  }, [snap.startsAt, now]);

  const checkoutStep = checkoutPreviewStep(preview);
  const forceOffline = preview === "offline";
  const forceAllHeld = preview === "all_held";

  if (preview === "paused" || snap.paused) {
    return <PausedScreen />;
  }

  const timedPhase = dropStarted
    ? snap.stock <= 0
      ? "sold_out"
      : "active"
    : computePhase(snap.stock, vip, now, snap.startsAt);

  if (preview === "pre_drop" || timedPhase === "pre_drop") {
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

  if (preview === "sold_out" || timedPhase === "sold_out" || snap.stock <= 0) {
    return <SoldOutScreen />;
  }

  return (
    <ActiveDropScreen
      snap={{
        ...snap,
        phase: "active",
        available: forceAllHeld ? 0 : snap.available,
        stock: forceAllHeld ? Math.max(snap.stock, 1) : snap.stock,
      }}
      prefill={prefill}
      forceOffline={forceOffline}
      forceAllHeld={forceAllHeld}
      checkoutPreviewStep={checkoutStep}
      checkoutOpen={!!checkoutStep}
    />
  );
}

export function DropApp({ initial }: DropAppProps) {
  const [boot, setBoot] = useState<{ preview: DropPreview | null; themeId: string | null } | null>(
    null,
  );

  useEffect(() => {
    setBoot(readPreviewParams());
  }, []);

  if (!boot) {
    return (
      <main className="flex h-[100dvh] items-center justify-center bg-[#1a0a12] text-[#ffe8ef]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
      </main>
    );
  }

  return (
    <ThemeProvider initialThemeId={boot.themeId ?? DROP_THEMES[0].id}>
      <DropAppInner initial={initial} preview={boot.preview} />
    </ThemeProvider>
  );
}
