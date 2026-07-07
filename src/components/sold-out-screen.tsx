"use client";

import { ScreenShell } from "./screen-shell";
import { ProductSlider } from "./product-slider";
import { useTheme } from "@/lib/theme-context";
import { DROP_CONFIG } from "@/lib/drop-config";

export function SoldOutScreen() {
  const { theme } = useTheme();

  return (
    <ScreenShell
      dimmed
      stock={0}
      totalStock={DROP_CONFIG.totalStock}
      soldOut
      toolbarVariant={theme.toolbarVariant}
      shareTitle={`THE4 — ${theme.name}`}
      shareText={`${theme.name} — Sold Out`}
    >
      <section className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <ProductSlider />
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ background: "var(--overlay-scrim)" }}
        >
          <span
            className="border-4 px-6 py-3 text-xl font-bold uppercase tracking-[0.35em] md:text-2xl"
            style={{
              borderColor: "var(--soldout-stamp)",
              color: "var(--soldout-stamp)",
            }}
          >
            Sold Out
          </span>
        </div>
      </section>

      <section className="shrink-0 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
        <p className="text-center text-sm uppercase tracking-[0.2em] text-[var(--muted)]">
          Edition closed
        </p>
      </section>
    </ScreenShell>
  );
}
