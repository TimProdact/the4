"use client";

import { useState } from "react";
import type { DropSnapshot } from "@/lib/api";
import { DROP_THEMES, type DropTheme } from "@/lib/drop-themes";
import { ProductSlider } from "./product-slider";
import { CheckoutSheet } from "./checkout-sheet";
import { ScreenShell } from "./screen-shell";
import { useOnline } from "@/hooks/use-online";

interface ActiveDropScreenProps {
  snap: DropSnapshot;
  prefill?: { name?: string; phone?: string };
}

export function ActiveDropScreen({ snap, prefill }: ActiveDropScreenProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [theme, setTheme] = useState<DropTheme>(DROP_THEMES[0]);
  const online = useOnline();

  const stock = snap.available;
  const soldOut = snap.phase === "sold_out" || snap.stock <= 0;
  const themedSnap = {
    ...snap,
    name: theme.name,
    edition: theme.edition,
    price: theme.price,
  };

  return (
    <ScreenShell
      offline={!online}
      stock={stock}
      totalStock={snap.totalStock}
      soldOut={soldOut}
      toolbarVariant={theme.toolbarVariant}
      shareTitle={`THE4 — ${theme.name}`}
      shareText={`${theme.name} — ${theme.edition} on THE4`}
    >
      <section
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        aria-label="Продукт"
      >
        <ProductSlider onThemeChange={setTheme} />
      </section>

      <section
        className="shrink-0 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2"
        aria-label="Покупка"
      >
        {!soldOut && (
          <button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            className="w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.28em] text-[var(--btn-text)] transition active:scale-[0.99] md:py-5"
          >
            Buy Now
          </button>
        )}
      </section>

      <CheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        snap={themedSnap}
        prefill={prefill}
        offline={!online}
      />
    </ScreenShell>
  );
}
