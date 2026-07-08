"use client";

import type { DropTheme } from "@/lib/drop-themes";

const GLYPH: Record<string, string> = {
  "cream-tube": "◎",
  "cosmetic-mirror": "◐",
  "pixel-compact": "▣",
  "velvet-wings": "✦",
  heart: "♥",
  plant: "🌿",
  "toilet-paper": "○",
  zombie: "☽",
  "pixel-figure": "▣",
  raccoon: "◈",
  dance: "✧",
  bomb: "●",
  light: "✺",
};

interface ThemeModelPlaceholderProps {
  theme: DropTheme;
}

export function ThemeModelPlaceholder({ theme }: ThemeModelPlaceholderProps) {
  const glyph = GLYPH[theme.id] ?? "◆";

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center"
      style={{
        background: `radial-gradient(circle at 50% 40%, color-mix(in srgb, ${theme.colors.accent} 28%, ${theme.colors.bg}), ${theme.colors.bg})`,
      }}
    >
      <div
        className="flex h-[min(38dvh,14rem)] w-[min(38dvh,14rem)] items-center justify-center rounded-full border border-[var(--fg)]/10 text-6xl shadow-[inset_0_0_60px_rgba(0,0,0,0.08)]"
        style={{ color: theme.colors.accent }}
        aria-hidden
      >
        {glyph}
      </div>
      <p className="mt-6 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--muted)]">
        3D preview · {theme.name}
      </p>
    </div>
  );
}
