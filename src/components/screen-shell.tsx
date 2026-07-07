"use client";

import { DropToolbar } from "./drop-toolbar";

export function OfflineBanner() {
  return (
    <div className="bg-[var(--accent)] px-4 py-2 text-center text-xs font-medium tracking-wide text-white">
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
  toolbarVariant?: "light" | "dark";
}

export function ScreenShell({
  children,
  offline,
  dimmed,
  stock,
  totalStock,
  soldOut,
  toolbarVariant = "light",
}: ScreenShellProps) {
  return (
    <main
      className={`relative flex h-[100dvh] flex-col overflow-hidden bg-[var(--bg)] ${
        dimmed ? "grayscale" : ""
      }`}
    >
      {offline && <OfflineBanner />}
      <DropToolbar
        variant={toolbarVariant}
        stock={stock}
        totalStock={totalStock}
        soldOut={soldOut}
      />
      {children}
    </main>
  );
}
