export type DropPreview =
  | "pre_drop"
  | "active"
  | "sold_out"
  | "paused"
  | "offline"
  | "all_held"
  | "checkout_summary"
  | "checkout_hold_expired"
  | "checkout_race_lost"
  | "checkout_payment_failed"
  | "checkout_pending";

export type CheckoutPreview =
  | "summary"
  | "hold_expired"
  | "race_lost"
  | "payment_failed"
  | "pending";

const DROP_PREVIEWS = new Set<string>([
  "pre_drop",
  "active",
  "sold_out",
  "paused",
  "offline",
  "all_held",
  "checkout_summary",
  "checkout_hold_expired",
  "checkout_race_lost",
  "checkout_payment_failed",
  "checkout_pending",
]);

export function readPreviewParams() {
  if (typeof window === "undefined") {
    return { preview: null as DropPreview | null, themeId: null as string | null };
  }
  const p = new URLSearchParams(window.location.search);
  const raw = p.get("preview");
  const preview = raw && DROP_PREVIEWS.has(raw) ? (raw as DropPreview) : null;
  const themeId = p.get("theme");
  return { preview, themeId };
}

export function checkoutPreviewStep(preview: DropPreview | null): CheckoutPreview | null {
  if (!preview?.startsWith("checkout_")) return null;
  return preview.replace("checkout_", "") as CheckoutPreview;
}
