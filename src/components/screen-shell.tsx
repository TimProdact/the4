"use client";

import { DropToolbar } from "./drop-toolbar";
import type { DropBadgePhase } from "@/lib/preview";
import { useT } from "@/lib/i18n";

export function OfflineBanner() {
  const { t } = useT();
  return (
    <div className="bg-[var(--state-error)] px-4 py-2 text-center text-xs font-semibold tracking-wide text-[var(--btn-text)]">
      {t("offline.banner")}
    </div>
  );
}

interface ScreenShellProps {
  children: React.ReactNode;
  offline?: boolean;
  dimmed?: boolean;
  badgePhase?: DropBadgePhase;
  stock?: number;
  totalStock?: number;
  badgeStartsAt?: string;
  previewPreDrop?: boolean;
  onBadgeLongPressStart?: () => void;
  onBadgeLongPressEnd?: () => void;
  toolbarVariant?: "light" | "dark";
  shareTitle?: string;
  shareText?: string;
}

export function ScreenShell({
  children,
  offline,
  dimmed,
  badgePhase,
  stock,
  totalStock,
  badgeStartsAt,
  previewPreDrop,
  onBadgeLongPressStart,
  onBadgeLongPressEnd,
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
        badgePhase={badgePhase}
        stock={stock}
        totalStock={totalStock}
        badgeStartsAt={badgeStartsAt}
        previewPreDrop={previewPreDrop}
        onBadgeLongPressStart={onBadgeLongPressStart}
        onBadgeLongPressEnd={onBadgeLongPressEnd}
        shareTitle={shareTitle}
        shareText={shareText}
      />
      {children}
    </main>
  );
}
