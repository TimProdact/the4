"use client";

import type { DropBadgePhase } from "@/lib/preview";
import { useT } from "@/lib/i18n";
import { ThemeCountdown } from "./theme-countdown";

interface StockPillProps {
  phase: DropBadgePhase;
  stock?: number;
  totalStock?: number;
  startsAt?: string;
  previewPreDrop?: boolean;
  onCyclePreview?: () => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
}

const pillClass =
  "inline-flex items-center rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition active:scale-95";

export function StockPill({
  phase,
  stock = 0,
  totalStock = 0,
  startsAt,
  previewPreDrop = false,
  onCyclePreview,
  onLongPressStart,
  onLongPressEnd,
}: StockPillProps) {
  const { t } = useT();

  if (phase === "pre_drop") {
    return (
      <button
        type="button"
        onClick={onCyclePreview}
        aria-label={t("stock.preDropAria")}
        className={`${pillClass} bg-[var(--stock-pill-bg)] text-[var(--stock-pill-text)]`}
        onPointerDown={onLongPressStart}
        onPointerUp={onLongPressEnd}
        onPointerLeave={onLongPressEnd}
        onContextMenu={e => onLongPressStart && e.preventDefault()}
      >
        {startsAt ? (
          <ThemeCountdown
            startsAt={startsAt}
            previewMode={previewPreDrop}
            variant="badge"
          />
        ) : (
          t("stock.preDrop")
        )}
      </button>
    );
  }

  if (phase === "sold_out") {
    return (
      <button
        type="button"
        onClick={onCyclePreview}
        aria-label={t("stock.soldOutAria")}
        className={`${pillClass} bg-[var(--stock-pill-bg)] text-[var(--stock-sold-text)]`}
      >
        {t("stock.soldOut")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onCyclePreview}
      aria-label={t("stock.remainingAria", { stock, total: totalStock })}
      className={`${pillClass} bg-[var(--stock-pill-bg)] text-[var(--stock-pill-text)] ${
        stock > 0 && stock <= 3 ? "ring-1 ring-[var(--accent)]/30" : ""
      }`}
    >
      {t("stock.remaining", { stock, total: totalStock })}
    </button>
  );
}
