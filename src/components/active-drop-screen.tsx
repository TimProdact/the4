"use client";

import { useEffect, useState } from "react";
import type { DropSnapshot } from "@/lib/api";
import type { DropTheme } from "@/lib/drop-themes";
import { useTheme } from "@/lib/theme-context";
import type { CheckoutPreview } from "@/lib/preview";
import { ProductSlider } from "./product-slider";
import { CheckoutSheet } from "./checkout-sheet";
import { ScreenShell } from "./screen-shell";
import { useOnline } from "@/hooks/use-online";

interface ActiveDropScreenProps {
  snap: DropSnapshot;
  prefill?: { name?: string; phone?: string };
  forceOffline?: boolean;
  forceAllHeld?: boolean;
  checkoutPreviewStep?: CheckoutPreview | null;
  checkoutOpen?: boolean;
}

export function ActiveDropScreen({
  snap,
  prefill,
  forceOffline,
  forceAllHeld,
  checkoutPreviewStep,
  checkoutOpen: checkoutOpenPreview,
}: ActiveDropScreenProps) {
  const { theme, setTheme } = useTheme();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const online = useOnline();

  useEffect(() => {
    if (checkoutOpenPreview) setCheckoutOpen(true);
  }, [checkoutOpenPreview]);

  const stock = forceAllHeld ? 0 : snap.available;
  const soldOut = snap.phase === "sold_out" || snap.stock <= 0;
  const allHeld = forceAllHeld || (snap.stock > 0 && snap.available <= 0);
  const offline = forceOffline || !online;

  const themedSnap = {
    ...snap,
    name: theme.name,
    edition: theme.edition,
    price: theme.price,
  };

  return (
    <ScreenShell
      offline={offline}
      stock={stock}
      totalStock={snap.totalStock}
      soldOut={soldOut}
      allHeld={allHeld}
      toolbarVariant={theme.toolbarVariant}
      shareTitle={`THE4 — ${theme.name}`}
      shareText={`${theme.name} — ${theme.edition} on THE4`}
    >
      <section
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        aria-label="Продукт"
      >
        <ProductSlider onThemeChange={(t: DropTheme) => setTheme(t)} />
      </section>

      <section
        className="shrink-0 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2"
        aria-label="Покупка"
      >
        {allHeld && !soldOut && (
          <p className="mb-3 text-center text-xs text-[var(--state-warning)]">
            Все экземпляры в резерве — попробуй через минуту
          </p>
        )}
        {!soldOut && (
          <button
            type="button"
            onClick={() => setCheckoutOpen(true)}
            disabled={allHeld && !checkoutOpenPreview}
            className="w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.28em] text-[var(--btn-text)] transition active:scale-[0.99] disabled:opacity-45 md:py-5"
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
        offline={offline}
        initialStep={checkoutPreviewStep ?? undefined}
        previewFailedOrderId={checkoutPreviewStep === "payment_failed" ? 1001 : undefined}
      />
    </ScreenShell>
  );
}
