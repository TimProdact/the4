"use client";

import { DropToolbar } from "./drop-toolbar";
import { useTheme } from "@/lib/theme-context";
import { useT } from "@/lib/i18n";

export function PausedScreen() {
  const { theme } = useTheme();
  const { t } = useT();

  return (
    <main className="theme-screen flex h-[100dvh] flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <DropToolbar variant={theme.toolbarVariant} shareTitle="THE4 — Paused" />
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <span className="rounded-full bg-[var(--stock-pill-bg)] px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--state-warning)]">
          {t("drop.pausedBadge")}
        </span>
        <h1 className="mt-8 text-center text-2xl font-semibold uppercase tracking-[0.15em]">
          {t("drop.pausedTitle")}
        </h1>
        <p className="mt-4 max-w-xs text-center text-sm text-[var(--muted)]">
          {t("drop.pausedBody")}
        </p>
      </div>
    </main>
  );
}
