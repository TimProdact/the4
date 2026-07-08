"use client";

import { useState } from "react";
import type { DropBadgePhase } from "@/lib/preview";
import { usePreview } from "@/lib/preview-context";
import { useProfile } from "@/lib/profile-context";
import { useT } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";
import { StockPill } from "./stock-pill";
import { CatAvatar } from "./cat-avatar";

interface DropToolbarProps {
  variant?: "light" | "dark";
  badgePhase?: DropBadgePhase;
  stock?: number;
  totalStock?: number;
  badgeStartsAt?: string;
  previewPreDrop?: boolean;
  onBadgeLongPressStart?: () => void;
  onBadgeLongPressEnd?: () => void;
  shareTitle?: string;
  shareText?: string;
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 16V4m0 0 4 4m-4-4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.5v7.25A2.25 2.25 0 0 0 8.25 20h7.5A2.25 2.25 0 0 0 18 17.75V10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="m6 12.5 3.5 3.5L18 8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DropToolbar({
  variant = "light",
  badgePhase,
  stock,
  totalStock,
  badgeStartsAt,
  previewPreDrop,
  onBadgeLongPressStart,
  onBadgeLongPressEnd,
  shareTitle = "THE4",
  shareText,
}: DropToolbarProps) {
  const [shared, setShared] = useState(false);
  const { cyclePreview } = usePreview();
  const { openProfile, persona, user } = useProfile();
  const { t } = useT();
  const dark = variant === "dark";
  const resolvedShareText = shareText ?? t("toolbar.shareText");

  const circleClass = dark
    ? "flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[var(--fg)] transition active:scale-95"
    : "flex h-11 w-11 items-center justify-center rounded-full border border-[var(--fg)]/10 bg-[var(--bg)] text-[var(--fg)] transition active:scale-95";

  const handleShare = async () => {
    trackEvent("share_click");
    const url = window.location.href;
    const payload = { title: shareTitle, text: resolvedShareText, url };

    if (navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        /* cancelled */
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      window.prompt(t("common.copyLink"), url);
    }
  };

  return (
    <header className="grid shrink-0 grid-cols-[2.75rem_1fr_2.75rem] items-center gap-3 px-5 py-4 md:px-6 md:py-5">
      <button
        type="button"
        onClick={openProfile}
        aria-label={t("toolbar.profile")}
        className={`${circleClass} justify-self-start overflow-hidden p-0`}
      >
        <CatAvatar avatarId={persona.avatarId} size="sm" unknown={!user} />
      </button>

      <div className="flex justify-center">
        {badgePhase ? (
          <StockPill
            phase={badgePhase}
            stock={stock}
            totalStock={totalStock}
            startsAt={badgeStartsAt}
            previewPreDrop={previewPreDrop}
            onCyclePreview={cyclePreview}
            onLongPressStart={onBadgeLongPressStart}
            onLongPressEnd={onBadgeLongPressEnd}
          />
        ) : (
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            The4
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleShare}
        aria-label={shared ? t("toolbar.linkCopied") : t("toolbar.share")}
        className={`${circleClass} justify-self-end`}
      >
        {shared ? <CheckIcon /> : <ShareIcon />}
      </button>
    </header>
  );
}
