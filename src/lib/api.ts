import { DROP_CONFIG } from "@/lib/drop-config";

export type DropPhase = "pre_drop" | "active" | "sold_out";

export interface DropSnapshot {
  phase: DropPhase;
  stock: number;
  available: number;
  totalStock: number;
  startsAt: string;
  price: number;
  currency: string;
  name: string;
  edition: string;
  images: readonly string[];
}

export interface CheckoutResult {
  ok: boolean;
  orderId: number;
  receipt: string;
  taneeshAchievement: string;
}

export async function fetchDrop(vip = false): Promise<DropSnapshot> {
  const res = await fetch(`/api/drop${vip ? "?vip=1" : ""}`, { cache: "no-store" });
  return res.json();
}

export async function unlockVip(password: string) {
  const res = await fetch("/api/vip", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка");
  return data;
}

export async function createHold() {
  const res = await fetch("/api/hold", { method: "POST" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка резерва");
  return data as { holdId: string; expiresAt: number };
}

export async function completeCheckout(payload: {
  holdId: string;
  name: string;
  phone: string;
  deliveryType: "delivery" | "pickup";
  address: string;
}) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка оплаты");
  return data as CheckoutResult;
}

export { DROP_CONFIG };
