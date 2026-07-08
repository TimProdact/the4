"use client";

import { useMemo } from "react";
import { useCountdown } from "@/hooks/use-countdown";
import { resolvePreDropStartsAt } from "@/lib/pre-drop";

interface ThemeCountdownProps {
  startsAt: string;
  previewMode?: boolean;
  className?: string;
  variant?: "default" | "badge";
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
}

export function ThemeCountdown({
  startsAt,
  previewMode = false,
  className = "",
  variant = "default",
  onLongPressStart,
  onLongPressEnd,
}: ThemeCountdownProps) {
  const target = useMemo(
    () => resolvePreDropStartsAt(startsAt, previewMode),
    [startsAt, previewMode],
  );
  const { h, m, s } = useCountdown(target);

  const isBadge = variant === "badge";
  const time = isBadge ? `${h}:${m}:${s}` : `${h} : ${m} : ${s}`;

  return (
    <span
      className={`tabular-nums ${isBadge ? "text-[0.68rem] font-semibold uppercase tracking-[0.1em]" : "shrink-0 text-center text-base font-medium tracking-wide text-[var(--fg)]"} ${className}`}
      style={{ fontVariantNumeric: "tabular-nums slashed-zero" }}
      aria-live="polite"
      onPointerDown={onLongPressStart}
      onPointerUp={onLongPressEnd}
      onPointerLeave={onLongPressEnd}
      onContextMenu={e => onLongPressStart && e.preventDefault()}
    >
      {time}
    </span>
  );
}
