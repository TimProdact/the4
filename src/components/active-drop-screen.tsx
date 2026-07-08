"use client";

import { useEffect, useMemo, useState } from "react";
import type { DropSnapshot } from "@/lib/api";
import type { DropTheme } from "@/lib/drop-themes";
import type { CheckoutPreview } from "@/lib/preview";
import { trackEvent } from "@/lib/analytics";
import { useTheme } from "@/lib/theme-context";
import { useT } from "@/lib/i18n";
import { ProductSlider } from "./product-slider";
import { CheckoutSheet } from "./checkout-sheet";
import { ScreenShell } from "./screen-shell";
import { canBuyTheme, getThemeBadge, getThemeStartsAt, isPreDropTheme, themeBuyLabel } from "@/lib/theme-drop-status";
import { useOnline } from "@/hooks/use-online";
import { WaitlistNotifySection } from "./waitlist-notify-section";

interface ActiveDropScreenProps {
  snap: DropSnapshot;
  prefill?: { name?: string; phone?: string };
  checkoutPreview?: CheckoutPreview;
}

export function ActiveDropScreen({ snap, prefill, checkoutPreview }: ActiveDropScreenProps) {
  const { theme, setTheme } = useTheme();
  const { t, locale } = useT();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [stockTick, setStockTick] = useState(0);
  const online = useOnline();

  useEffect(() => {
    const refresh = () => setStockTick(t => t + 1);
    window.addEventListener("the4:theme-stock", refresh);
    return () => window.removeEventListener("the4:theme-stock", refresh);
  }, []);

  useEffect(() => {
    if (checkoutPreview) setCheckoutOpen(true);
  }, [checkoutPreview]);

  const badge = useMemo(() => getThemeBadge(theme.id), [theme.id, stockTick]);
  const buyEnabled = canBuyTheme(theme.id);
  const preDrop = isPreDropTheme(theme.id);
  const badgeStartsAt =
    badge.phase === "pre_drop" ? getThemeStartsAt(theme.id, snap.startsAt) : undefined;

  const themedSnap = {
    ...snap,
    name: theme.name,
    edition: theme.edition,
    price: theme.price,
  };

  return (
    <ScreenShell
      offline={!online}
      badgePhase={badge.phase}
      stock={badge.stock}
      totalStock={badge.totalStock}
      badgeStartsAt={badgeStartsAt}
      dimmed={badge.phase === "sold_out"}
      toolbarVariant={theme.toolbarVariant}
      shareTitle={`THE4 — ${theme.name}`}
      shareText={`${theme.name} — ${theme.edition} on THE4`}
    >
      <section
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden"
        aria-label={t("drop.productAria")}
      >
        <ProductSlider onThemeChange={(next: DropTheme) => setTheme(next)} />
      </section>

      <section
        className="shrink-0 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2"
        aria-label={t("drop.buyAria")}
      >
        {preDrop ? (
          <WaitlistNotifySection />
        ) : (
          <>
            {badge.phase === "active" && badge.stock > 0 && badge.stock <= 3 && (
              <p className="mb-3 text-center text-xs text-[var(--state-warning)]">
                {t("drop.lowStock")}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                trackEvent("buy_now_click");
                setCheckoutOpen(true);
              }}
              disabled={!buyEnabled}
              className="w-full bg-[var(--btn)] py-4 text-sm font-semibold uppercase tracking-[0.28em] text-[var(--btn-text)] transition active:scale-[0.99] disabled:opacity-45 md:py-5"
            >
              {themeBuyLabel(theme.id, locale)}
            </button>
          </>
        )}
      </section>

      <CheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        snap={themedSnap}
        themeId={theme.id}
        prefill={prefill}
        offline={!online}
        initialStep={checkoutPreview}
        previewFailedOrderId={checkoutPreview === "payment_failed" ? 1003 : undefined}
      />
    </ScreenShell>
  );
}
