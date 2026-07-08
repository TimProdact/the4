import { DROP_CONFIG } from "./drop-config";
import {
  adminActionClient,
  adminFetchClient,
  adminLoginClient,
  adminLogoutClient,
  completeCheckoutClient,
  createHoldClient,
  fetchDropClient,
  fetchOrderClient,
  joinWaitlistClient,
  isOnWaitlistClient,
  releaseHoldClient,
  unlockVipClient,
} from "./client-store";
import {
  fetchRemoteDrop,
  remoteDropEnabled,
  remotePublicAction,
} from "./remote-drop-api";
import { getOrdersForUser } from "./profile-store";
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
  if (remoteDropEnabled()) {
    const remote = await fetchRemoteDrop(vip);
    if (remote) return remote;
  }
  return fetchDropClient(vip);
}

export async function unlockVip(password: string) {
  if (remoteDropEnabled()) {
    return remotePublicAction("unlock_vip", { password });
  }
  return unlockVipClient(password);
}

export async function createHold(themeId?: string) {
  if (remoteDropEnabled()) {
    return remotePublicAction<{ holdId: string; expiresAt: number } & DropSnapshot>(
      "create_hold",
      { themeId },
    );
  }
  return createHoldClient(themeId);
}

export async function releaseHold(holdId: string) {
  if (remoteDropEnabled()) {
    await remotePublicAction("release_hold", { holdId });
    return;
  }
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
  productName?: string;
  edition?: string;
  amount?: number;
  themeId?: string;
}) {
  if (remoteDropEnabled()) {
    return remotePublicAction<CheckoutResult & DropSnapshot>("complete_checkout", payload);
  }
  return completeCheckoutClient(payload);
}

export function getUserOrders(phone: string) {
  return getOrdersForUser(phone);
}

export async function fetchOrder(id: number): Promise<Order> {
  return fetchOrderClient(id);
}

export async function joinWaitlist(contact: string) {
  if (remoteDropEnabled()) {
    return remotePublicAction("join_waitlist", { contact });
  }
  return joinWaitlistClient(contact);
}

export function isOnWaitlist(contact: string) {
  return isOnWaitlistClient(contact);
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

export function adminLogout(token: string) {
  adminLogoutClient(token);
}
