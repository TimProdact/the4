"use client";

import { ProductHero } from "./product-hero";
import { ScreenShell } from "./screen-shell";
import { DROP_CONFIG } from "@/lib/drop-config";

export function SoldOutScreen() {
  return (
    <ScreenShell dimmed stock={0} totalStock={DROP_CONFIG.totalStock} soldOut>
      <section className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden">
        <ProductHero
          name={DROP_CONFIG.name}
          edition={DROP_CONFIG.edition}
          price={DROP_CONFIG.price}
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
          <span className="border-4 border-white px-6 py-3 text-xl font-bold uppercase tracking-[0.35em] text-white md:text-2xl">
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
