export const DROP_CONFIG = {
  productSlug: "silk-repair-01",
  name: "SILK REPAIR",
  edition: "Face Cream · 1st Drop",
  price: 320_000,
  currency: "UZS",
  totalStock: 100,
  /** ISO — до этого момента Pre-Drop. По умолчанию в прошлом = Active. */
  startsAt: process.env.DROP_STARTS_AT || "2020-01-01T00:00:00.000Z",
  vipPassword: process.env.VIP_PASSWORD || "THE4",
  adminPassword: process.env.ADMIN_PASSWORD || "THE4ADMIN",
  pickupAddress: "Ташкент, Magic City Event Hall",
  holdMinutes: 5,
  sellerTelegram: process.env.NEXT_PUBLIC_SELLER_TELEGRAM || "https://t.me/mundesign",
  images: [
    "https://images.unsplash.com/photo-1615485503744-192c76a5de68?w=1200&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1578301978693-85fa9c0320b4?w=1200&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200&q=85&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1610701596007-6a2494ebbfdb?w=1200&q=85&auto=format&fit=crop",
  ],
} as const;

export type DropPhase = "pre_drop" | "active" | "sold_out";

export function computePhase(
  stock: number,
  vipOverride: boolean,
  now = Date.now(),
  startsAt: string = DROP_CONFIG.startsAt,
): DropPhase {
  if (stock <= 0) return "sold_out";
  if (vipOverride) return "active";
  if (now < new Date(startsAt).getTime()) return "pre_drop";
  return "active";
}

export function refreshPhase(
  store: { phase: DropPhase; stock: number; startsAt: string },
  vipOverride = false,
) {
  store.phase = computePhase(store.stock, vipOverride, Date.now(), store.startsAt);
}
