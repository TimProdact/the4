"use client";

import { useState } from "react";
import type { CheckoutResult, DropSnapshot } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { Logo } from "./logo";
import { ProductCarousel } from "./product-carousel";
import { CheckoutSheet } from "./checkout-sheet";
import { SuccessOverlay } from "./success-overlay";

interface ActiveDropScreenProps {
  snap: DropSnapshot;
  prefill?: { name?: string; phone?: string };
}

export function ActiveDropScreen({ snap, prefill }: ActiveDropScreenProps) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [success, setSuccess] = useState<CheckoutResult | null>(null);

  const stock = snap.available;
  const soldOut = snap.phase === "sold_out" || stock <= 0;

  return (
    <main className="relative grid h-[100dvh] grid-rows-[10fr_65fr_25fr] overflow-hidden bg-[var(--bg)]">
      <header className="min-h-0 shrink-0 border-b border-black/[0.04]">
        <Logo />
      </header>

      <section className="relative min-h-0 overflow-hidden" aria-label="Продукт">
        <ProductCarousel images={snap.images} />
        {success && (
          <SuccessOverlay
            receipt={success.receipt}
            onDismiss={() => setSuccess(null)}
          />
        )}
      </section>

      <section
        className="min-h-0 shrink-0 border-t border-black/[0.04]"
        aria-label="Покупка"
      >
        <div className="flex h-full flex-col justify-end px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
          <p className="text-center text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
            {snap.name}
            <span className="mx-2 text-[var(--fg)]/20">—</span>
            {snap.edition}
          </p>

          <p
            className={`mt-2 text-center text-sm font-medium tracking-wide md:text-base ${
              soldOut ? "text-[var(--muted)]" : "text-[var(--accent)]"
            }`}
            style={soldOut ? undefined : { textShadow: "0 0 20px rgba(255,45,45,0.35)" }}
          >
            {soldOut
              ? "SOLD OUT"
              : `Осталось: ${stock} / ${snap.totalStock}`}
          </p>

          <p className="mt-4 text-center text-3xl font-semibold tracking-tight md:text-4xl">
            {formatPrice(snap.price)}
          </p>

          {!soldOut && (
            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="mt-4 w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#e8e6e1] transition active:scale-[0.99] md:py-5"
            >
              Buy Now
            </button>
          )}
        </div>
      </section>

      <CheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        snap={snap}
        prefill={prefill}
        onSuccess={setSuccess}
      />
    </main>
  );
}
