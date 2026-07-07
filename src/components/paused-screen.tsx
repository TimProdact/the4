"use client";

import { DropToolbar } from "./drop-toolbar";
import { Logo } from "./logo";
import { useTheme } from "@/lib/theme-context";

export function PausedScreen() {
  const { theme } = useTheme();

  return (
    <main className="theme-screen flex h-[100dvh] flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <DropToolbar variant={theme.toolbarVariant} shareTitle="THE4 — Paused" />
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <span className="rounded-full bg-[var(--stock-pill-bg)] px-4 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--state-warning)]">
          Paused
        </span>
        <h1 className="mt-8 text-center text-2xl font-semibold uppercase tracking-[0.15em]">
          Drop Paused
        </h1>
        <p className="mt-4 max-w-xs text-center text-sm text-[var(--muted)]">
          Дроп временно приостановлен. Вернись позже — мы откроем снова.
        </p>
        <Logo variant={theme.toolbarVariant === "dark" ? "light" : "dark"} />
      </div>
    </main>
  );
}
