import type { DropPhase } from "./drop-config";

export type OrderStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderBuyer {
  name: string;
  phone: string;
  deliveryType: "delivery" | "pickup";
  address: string;
}

export interface Order {
  id: number;
  receipt: string;
  status: OrderStatus;
  createdAt: string;
  buyer: OrderBuyer;
  amount: number;
}

export interface WaitlistEntry {
  id: string;
  contact: string;
  createdAt: number;
}

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
  paused: boolean;
}

export interface CheckoutResult {
  ok: boolean;
  orderId: number;
  receipt: string;
  taneeshAchievement: string;
  status: OrderStatus;
}

export interface AdminSnapshot {
  stock: number;
  totalStock: number;
  available: number;
  paused: boolean;
  startsAt: string;
  holds: { id: string; expiresAt: number }[];
  orders: Order[];
  waitlist: WaitlistEntry[];
}
