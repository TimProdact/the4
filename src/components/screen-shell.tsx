"use client";

import { DropToolbar } from "./drop-toolbar";

export function OfflineBanner() {
  return (
    <div className="bg-[var(--state-error)] px-4 py-2 text-center text-xs font-semibold tracking-wide text-[var(--btn-text)]">
      Нет сети — проверьте подключение
    </div>
  );
}

interface ScreenShellProps {
  children: React.ReactNode;
  offline?: boolean;
  dimmed?: boolean;
  stock?: number;
  totalStock?: number;
  soldOut?: boolean;
  allHeld?: boolean;
  toolbarVariant?: "light" | "dark";
  shareTitle?: string;
  shareText?: string;
}

export function ScreenShell({
  children,
  offline,
  dimmed,
  stock,
  totalStock,
  soldOut,
  allHeld,
  toolbarVariant = "light",
  shareTitle,
  shareText,
}: ScreenShellProps) {
  return (
    <main
      className={`theme-screen relative flex h-[100dvh] flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)] ${
        dimmed ? "grayscale" : ""
      }`}
    >
      {offline && <OfflineBanner />}
      <DropToolbar
        variant={toolbarVariant}
        stock={stock}
        totalStock={totalStock}
        soldOut={soldOut}
        allHeld={allHeld}
        shareTitle={shareTitle}
        shareText={shareText}
      />
      {children}
    </main>
  );
}
