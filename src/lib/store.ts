import { DROP_CONFIG, refreshPhase, type DropPhase } from "./drop-config";
import type { Order, WaitlistEntry } from "./types";

export interface DropSnapshot {
  phase: DropPhase;
  stock: number;
  totalStock: number;
  startsAt: string;
  holds: Record<string, { expiresAt: number }>;
  lastOrderId: number;
  paused: boolean;
  orders: Order[];
  waitlist: WaitlistEntry[];
}

const g = globalThis as typeof globalThis & { __the4Store?: DropSnapshot };

function createStore(): DropSnapshot {
  return {
    phase: "active",
    stock: 14,
    totalStock: DROP_CONFIG.totalStock,
    startsAt: DROP_CONFIG.startsAt,
    holds: {},
    lastOrderId: 1000,
    paused: false,
    orders: [],
    waitlist: [],
  };
}

export function getStore(): DropSnapshot {
  if (!g.__the4Store) {
    g.__the4Store = createStore();
    refreshPhase(g.__the4Store);
  }
  return g.__the4Store;
}

export function purgeExpiredHolds(store: DropSnapshot) {
  const now = Date.now();
  for (const [id, h] of Object.entries(store.holds)) {
    if (h.expiresAt <= now) delete store.holds[id];
  }
}

export function activeHoldsCount(store: DropSnapshot) {
  purgeExpiredHolds(store);
  return Object.keys(store.holds).length;
}

export function availableStock(store: DropSnapshot) {
  return Math.max(0, store.stock - activeHoldsCount(store));
}

type Listener = (snap: ReturnType<typeof getPublicSnapshot>) => void;
const listeners = new Set<Listener>();

export function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify() {
  const snap = getPublicSnapshot();
  listeners.forEach(fn => fn(snap));
}

export function getPublicSnapshot(vipOverride = false) {
  const store = getStore();
  refreshPhase(store, vipOverride);
  purgeExpiredHolds(store);
  return {
    phase: store.phase,
    stock: store.stock,
    available: availableStock(store),
    totalStock: store.totalStock,
    startsAt: store.startsAt,
    price: DROP_CONFIG.price,
    currency: DROP_CONFIG.currency,
    name: DROP_CONFIG.name,
    edition: DROP_CONFIG.edition,
    images: DROP_CONFIG.images,
    paused: store.paused,
  };
}

export function getAdminSnapshot() {
  const store = getStore();
  purgeExpiredHolds(store);
  return {
    stock: store.stock,
    totalStock: store.totalStock,
    available: availableStock(store),
    paused: store.paused,
    startsAt: store.startsAt,
    holds: Object.entries(store.holds).map(([id, h]) => ({
      id,
      expiresAt: h.expiresAt,
    })),
    orders: [...store.orders].reverse(),
    waitlist: [...store.waitlist].reverse(),
  };
}

export function getOrderById(id: number) {
  return getStore().orders.find(o => o.id === id) ?? null;
}

export function releaseHold(holdId: string) {
  const store = getStore();
  delete store.holds[holdId];
  notify();
}

export function clearAllHolds() {
  const store = getStore();
  store.holds = {};
  notify();
}
