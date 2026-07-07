"use client";

import { useState } from "react";
import type { DropSnapshot } from "@/lib/api";
import { ProductHero } from "./product-hero";
import { CheckoutSheet } from "./checkout-sheet";
import { ScreenShell } from "./screen-shell";
import { useOnline } from "@/hooks/use-online";

interface ActiveDropScreenProps {
  snap: DropSnapshot;
  prefill?: { name?: string; phone?: string };
}

export function ActiveDropScreen({ snap, prefill }: ActiveDropScreenProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const online = useOnline();

  const stock = snap.available;
  const soldOut = snap.phase === "sold_out" || snap.stock <= 0;

  return (
    <ScreenShell
      offline={!online}
      stock={stock}
      totalStock={snap.totalStock}
      soldOut={soldOut}
    >
      <section
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        aria-label="Продукт"
      >
        <ProductHero
          name={snap.name}
          edition={snap.edition}
          price={snap.price}
        />
      </section>

      <section
        className="shrink-0 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2"
        aria-label="Покупка"
      >
        {!soldOut && (
          <button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            className="w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#e8e6e1] transition active:scale-[0.99] md:py-5"
          >
            Buy Now
          </button>
        )}
      </section>

      <CheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        snap={snap}
        prefill={prefill}
        offline={!online}
      />
    </ScreenShell>
  );
}
