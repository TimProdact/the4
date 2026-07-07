import { DROP_CONFIG, computePhase, type DropPhase } from "./drop-config";

export interface DropSnapshot {
  phase: DropPhase;
  stock: number;
  totalStock: number;
  startsAt: string;
  holds: Record<string, { expiresAt: number }>;
  lastOrderId: number;
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
  };
}

export function getStore(): DropSnapshot {
  if (!g.__the4Store) {
    g.__the4Store = createStore();
    refreshPhase(g.__the4Store);
  }
  return g.__the4Store;
}

export function refreshPhase(store: DropSnapshot, vipOverride = false) {
  store.phase = computePhase(store.stock, vipOverride);
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
  };
}
