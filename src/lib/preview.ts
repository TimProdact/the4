export type DropPreview = "pre_drop" | "active" | "sold_out";

export type CheckoutPreview =
  | "summary"
  | "hold_expired"
  | "race_lost"
  | "payment_failed"
  | "pending";

export type DropBadgePhase = DropPreview;

/** Badge click cycles these states (dev / QA only). */
export const PREVIEW_CYCLE: DropPreview[] = ["active", "pre_drop", "sold_out"];

export const PREVIEW_LABELS: Record<DropPreview, string> = {
  active: "Active drop",
  pre_drop: "Pre-Drop",
  sold_out: "Sold Out",
};

const DROP_PREVIEWS = new Set<string>(["pre_drop", "active", "sold_out"]);
const CHECKOUT_PREVIEWS = new Set<string>([
  "summary",
  "hold_expired",
  "race_lost",
  "payment_failed",
  "pending",
]);

export function nextPreview(current: DropPreview | null): DropPreview {
  const idx = current ? PREVIEW_CYCLE.indexOf(current) : -1;
  return PREVIEW_CYCLE[(idx + 1) % PREVIEW_CYCLE.length];
}

export function readPreviewParams() {
  if (typeof window === "undefined") {
    return {
      preview: null as DropPreview | null,
      themeId: null as string | null,
      checkout: null as CheckoutPreview | null,
    };
  }
  const p = new URLSearchParams(window.location.search);
  const raw = p.get("preview");
  const preview = raw && DROP_PREVIEWS.has(raw) ? (raw as DropPreview) : null;
  const themeId = p.get("theme");
  const checkoutRaw = p.get("checkout");
  const checkout =
    checkoutRaw && CHECKOUT_PREVIEWS.has(checkoutRaw) ? (checkoutRaw as CheckoutPreview) : null;
  return { preview, themeId, checkout };
}
