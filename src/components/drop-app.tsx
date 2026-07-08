"use client";

import { useEffect, useState } from "react";
import type { DropSnapshot } from "@/lib/api";
import { DROP_THEMES } from "@/lib/drop-themes";
import { computePhase } from "@/lib/drop-config";
import { readPreviewParams, type CheckoutPreview, type DropPreview } from "@/lib/preview";
import { trackEvent } from "@/lib/analytics";
import { PreviewProvider, usePreview } from "@/lib/preview-context";
import { ThemeProvider } from "@/lib/theme-context";
import { useDropStream } from "@/hooks/use-drop-stream";
import { useNow } from "@/hooks/use-now";
import { PreDropScreen } from "./pre-drop-screen";
import { ActiveDropScreen } from "./active-drop-screen";

interface DropAppProps {
  initial: DropSnapshot;
  dropId?: string | null;
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

function DropScreens({
  initial,
  checkoutPreview,
  themeId,
  dropId,
}: {
  initial: DropSnapshot;
  checkoutPreview?: CheckoutPreview;
  themeId?: string | null;
  dropId?: string | null;
}) {
  const { preview } = usePreview();
  const [vip, setVip] = useState(false);
  const [dropStarted, setDropStarted] = useState(false);
  const [prefill, setPrefill] = useState<{ name?: string; phone?: string }>({});
  const snap = useDropStream(initial, dropId);
  const now = useNow(1000);

  useEffect(() => {
    trackEvent("drop_view", { preview: preview ?? "live" });
  }, [preview]);

  useEffect(() => {
    setVip(sessionStorage.getItem(VIP_KEY) === "1");
    setPrefill(readPrefill());
    if (preview === "active") {
      setDropStarted(true);
    }
  }, [preview]);

  useEffect(() => {
    if (preview) return;
    if (now < new Date(snap.startsAt).getTime()) {
      setDropStarted(false);
    }
  }, [snap.startsAt, now, preview]);

  const basePhase = snap.phase ?? computePhase(snap.stock, vip, now, snap.startsAt);
  const livePhase = vip && basePhase === "pre_drop" ? "active" : basePhase;

  const timedPhase = dropStarted
    ? snap.stock <= 0
      ? "sold_out"
      : "active"
    : livePhase;

  const phase: DropPreview | "active" | "pre_drop" | "sold_out" =
    preview === "active"
      ? "active"
      : preview === "pre_drop"
        ? "pre_drop"
        : preview === "sold_out"
          ? "sold_out"
          : timedPhase;

  return (
    <ThemeProvider
      initialThemeId={themeId ?? snap.product?.id ?? DROP_THEMES[0].id}
      liveProduct={snap.product}
    >
      {phase === "pre_drop" ? (
        <PreDropScreen
          startsAt={snap.startsAt}
          previewMode={preview === "pre_drop"}
          onVipUnlock={() => {
            sessionStorage.setItem(VIP_KEY, "1");
            setVip(true);
          }}
          onTimerDone={() => setDropStarted(true)}
        />
      ) : (
        <ActiveDropScreen
          snap={{ ...snap, phase: phase === "sold_out" ? "sold_out" : "active" }}
          prefill={prefill}
          checkoutPreview={checkoutPreview}
        />
      )}
    </ThemeProvider>
  );
}

export function DropApp({ initial, dropId = null }: DropAppProps) {
  const [boot, setBoot] = useState<{
    preview: DropPreview | null;
    themeId: string | null;
    checkout: CheckoutPreview | null;
  } | null>(null);

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
    <PreviewProvider initialPreview={boot.preview}>
      <DropScreens
        initial={initial}
        checkoutPreview={boot.checkout ?? undefined}
        themeId={boot.themeId}
        dropId={dropId}
      />
    </PreviewProvider>
  );
}
