"use client";

import { ScreenShell } from "./screen-shell";
import { ProductSlider } from "./product-slider";
import { useTheme } from "@/lib/theme-context";
import { getThemeBadge, themeBuyLabel } from "@/lib/theme-drop-status";
import { useT } from "@/lib/i18n";

export function SoldOutScreen() {
  const { theme, setTheme } = useTheme();
  const { locale } = useT();
  const badge = getThemeBadge(theme.id);

  return (
    <ScreenShell
      dimmed={badge.phase === "sold_out"}
      badgePhase={badge.phase}
      stock={badge.stock}
      totalStock={badge.totalStock}
      toolbarVariant={theme.toolbarVariant}
      shareTitle={`THE4 — ${theme.name}`}
      shareText={`${theme.name} — ${themeBuyLabel(theme.id, locale)}`}
    >
      <section className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <ProductSlider onThemeChange={t => setTheme(t)} />
      </section>

      <section className="shrink-0 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.28em] text-[var(--btn-text)] opacity-55 md:py-5"
        >
          {themeBuyLabel(theme.id, locale)}
        </button>
      </section>
    </ScreenShell>
  );
}
