import { DROP_CONFIG } from "./drop-config";
import {
  adminActionClient,
  adminFetchClient,
  adminLoginClient,
  completeCheckoutClient,
  createHoldClient,
  fetchDropClient,
  fetchOrderClient,
  joinWaitlistClient,
  releaseHoldClient,
  unlockVipClient,
} from "./client-store";
import type {
  AdminSnapshot,
  CheckoutResult,
  DropSnapshot,
  Order,
} from "./types";

export type { AdminSnapshot, CheckoutResult, DropSnapshot, Order };
export type DropPhase = DropSnapshot["phase"];
export { DROP_CONFIG };

export async function fetchDrop(vip = false): Promise<DropSnapshot> {
  return fetchDropClient(vip);
}

export async function unlockVip(password: string) {
  return unlockVipClient(password);
}

export async function createHold() {
  return createHoldClient();
}

export async function releaseHold(holdId: string) {
  releaseHoldClient(holdId);
}

export async function completeCheckout(payload: {
  holdId: string;
  holdExpiresAt?: number;
  name: string;
  phone: string;
  deliveryType: "delivery" | "pickup";
  address: string;
  paymentMethod?: "paylov" | "apple" | "google";
}) {
  return completeCheckoutClient(payload);
}

export async function fetchOrder(id: number): Promise<Order> {
  return fetchOrderClient(id);
}

export async function joinWaitlist(contact: string) {
  return joinWaitlistClient(contact);
}

export async function adminLogin(password: string) {
  return adminLoginClient(password);
}

export async function adminFetch(token: string): Promise<AdminSnapshot> {
  return adminFetchClient(token);
}

export async function adminAction(
  token: string,
  action: string,
  payload: Record<string, unknown> = {},
) {
  return adminActionClient(token, action, payload);
}
