import { DROP_CONFIG, refreshPhase as applyPhase } from "./drop-config";
import type {
  AdminSnapshot,
  CheckoutResult,
  DropSnapshot,
  Order,
  OrderStatus,
  WaitlistEntry,
} from "./types";

interface InternalStore {
  phase: DropSnapshot["phase"];
  stock: number;
  totalStock: number;
  startsAt: string;
  holds: Record<string, { expiresAt: number }>;
  lastOrderId: number;
  paused: boolean;
  orders: Order[];
  waitlist: WaitlistEntry[];
}

const STORAGE_KEY = "the4_store_v1";
const listeners = new Set<(snap: DropSnapshot) => void>();
const adminTokens = new Set<string>();

function uuid() {
  return crypto.randomUUID();
}

function defaultStore(): InternalStore {
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

function loadStore(): InternalStore {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore();
    return { ...defaultStore(), ...JSON.parse(raw) };
  } catch {
    return defaultStore();
  }
}

function saveStore(store: InternalStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function purgeExpiredHolds(store: InternalStore) {
  const now = Date.now();
  for (const [id, h] of Object.entries(store.holds)) {
    if (h.expiresAt <= now) delete store.holds[id];
  }
}

function activeHoldsCount(store: InternalStore) {
  purgeExpiredHolds(store);
  return Object.keys(store.holds).length;
}

function availableStock(store: InternalStore) {
  return Math.max(0, store.stock - activeHoldsCount(store));
}

function toPublicSnapshot(store: InternalStore, vipOverride = false): DropSnapshot {
  applyPhase(store, vipOverride);
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

function toAdminSnapshot(store: InternalStore): AdminSnapshot {
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

function notify(store: InternalStore) {
  const snap = toPublicSnapshot(store);
  listeners.forEach(fn => fn(snap));
}

function withStore<T>(fn: (store: InternalStore) => T): T {
  const store = loadStore();
  const result = fn(store);
  saveStore(store);
  notify(store);
  return result;
}

export function getDefaultPublicSnapshot(): DropSnapshot {
  return toPublicSnapshot(defaultStore());
}

export function subscribeDrop(fn: (snap: DropSnapshot) => void) {
  listeners.add(fn);
  fn(toPublicSnapshot(loadStore()));
  return () => {
    listeners.delete(fn);
  };
}

export function fetchDropClient(vip = false): DropSnapshot {
  const store = loadStore();
  const snap = toPublicSnapshot(store, vip);
  saveStore(store);
  return snap;
}

export function unlockVipClient(password: string) {
  if (password !== DROP_CONFIG.vipPassword) {
    throw new Error("Неверный пароль");
  }
  return { ok: true, vip: true, ...fetchDropClient(true) };
}

export function createHoldClient() {
  return withStore(store => {
    purgeExpiredHolds(store);

    if (store.paused) {
      const err = new Error("Дроп на паузе") as Error & { code?: string };
      err.code = "PAUSED";
      throw err;
    }
    if (store.stock <= 0) {
      const err = new Error("SOLD OUT") as Error & { code?: string };
      err.code = "SOLD_OUT";
      throw err;
    }
    if (availableStock(store) <= 0) {
      const err = new Error("Все в резерве, попробуйте через минуту") as Error & {
        code?: string;
      };
      err.code = "ALL_HELD";
      throw err;
    }

    const holdId = uuid();
    const expiresAt = Date.now() + DROP_CONFIG.holdMinutes * 60_000;
    store.holds[holdId] = { expiresAt };
    return { holdId, expiresAt, ...toPublicSnapshot(store) };
  });
}

export function releaseHoldClient(holdId: string) {
  withStore(store => {
    delete store.holds[holdId];
    return { ok: true, ...toPublicSnapshot(store) };
  });
}

export async function completeCheckoutClient(payload: {
  holdId: string;
  holdExpiresAt?: number;
  name: string;
  phone: string;
  deliveryType: "delivery" | "pickup";
  address: string;
  paymentMethod?: "paylov" | "apple" | "google";
}): Promise<CheckoutResult> {
  const {
    holdId,
    holdExpiresAt,
    name,
    phone,
    deliveryType,
    address,
    paymentMethod = "paylov",
  } = payload;

  const store = loadStore();
  purgeExpiredHolds(store);

  const serverHold = holdId ? store.holds[holdId] : null;
  const expiresAt = serverHold?.expiresAt ?? holdExpiresAt;

  if (!holdId || !expiresAt || expiresAt < Date.now()) {
    const err = new Error("Резерв истёк. Нажмите BUY NOW снова.") as Error & { code?: string };
    err.code = "HOLD_EXPIRED";
    throw err;
  }

  if (store.stock <= 0) {
    const err = new Error("Кто-то успел раньше. SOLD OUT.") as Error & { code?: string };
    err.code = "RACE_LOST";
    throw err;
  }

  if (paymentMethod === "google") {
    store.lastOrderId += 1;
    const orderId = store.lastOrderId;
    store.orders.push({
      id: orderId,
      receipt: `THE4-${orderId}`,
      status: "failed",
      createdAt: new Date().toISOString(),
      buyer: { name, phone, deliveryType, address },
      amount: DROP_CONFIG.price,
    });
    delete store.holds[holdId];
    saveStore(store);
    notify(store);
    const err = new Error("Оплата отклонена банком") as Error & {
      code?: string;
      orderId?: number;
    };
    err.code = "PAYMENT_FAILED";
    err.orderId = orderId;
    throw err;
  }

  await new Promise(r => setTimeout(r, paymentMethod === "apple" ? 800 : 1200));

  const status: OrderStatus = paymentMethod === "apple" ? "pending" : "paid";
  store.stock -= 1;
  delete store.holds[holdId];
  store.lastOrderId += 1;
  applyPhase(store);

  const orderId = store.lastOrderId;
  const receipt = `THE4-${orderId}`;
  store.orders.push({
    id: orderId,
    receipt,
    status,
    createdAt: new Date().toISOString(),
    buyer: { name, phone, deliveryType, address },
    amount: DROP_CONFIG.price,
  });

  saveStore(store);
  notify(store);

  return {
    ok: true,
    orderId,
    receipt,
    status,
    taneeshAchievement: status === "paid" ? "Владелец The4" : "",
  };
}

export function fetchOrderClient(id: number): Order {
  const order = loadStore().orders.find(o => o.id === id);
  if (!order) throw new Error("Заказ не найден");
  return order;
}

export function joinWaitlistClient(contact: string) {
  const trimmed = contact.trim();
  if (!trimmed) throw new Error("Укажите телефон или email");

  return withStore(store => {
    if (store.waitlist.some(w => w.contact === trimmed)) {
      return { ok: true, already: true };
    }
    store.waitlist.push({ id: uuid(), contact: trimmed, createdAt: Date.now() });
    return { ok: true };
  });
}

export function adminLoginClient(password: string): string {
  if (password !== DROP_CONFIG.adminPassword) {
    throw new Error("Неверный пароль");
  }
  const token = `adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  adminTokens.add(token);
  return token;
}

function assertAdmin(token: string) {
  if (!adminTokens.has(token)) throw new Error("Unauthorized");
}

export function adminFetchClient(token: string): AdminSnapshot {
  assertAdmin(token);
  return toAdminSnapshot(loadStore());
}

export function adminActionClient(
  token: string,
  action: string,
  payload: Record<string, unknown> = {},
): AdminSnapshot {
  assertAdmin(token);

  return withStore(store => {
    switch (action) {
      case "set_stock": {
        const stock = Number(payload.stock);
        if (!Number.isFinite(stock) || stock < 0) throw new Error("Invalid stock");
        store.stock = Math.min(stock, store.totalStock);
        applyPhase(store);
        break;
      }
      case "set_paused":
        store.paused = Boolean(payload.paused);
        applyPhase(store);
        break;
      case "clear_holds":
        store.holds = {};
        break;
      case "set_starts_at":
        store.startsAt = String(payload.startsAt || DROP_CONFIG.startsAt);
        applyPhase(store);
        break;
      case "mark_order": {
        const order = store.orders.find(o => o.id === Number(payload.orderId));
        if (!order) throw new Error("Not found");
        order.status = payload.status as OrderStatus;
        break;
      }
      case "confirm_pending": {
        const order = store.orders.find(o => o.id === Number(payload.orderId));
        if (!order) throw new Error("Not found");
        order.status = "paid";
        break;
      }
      case "reset_demo":
        Object.assign(store, defaultStore());
        applyPhase(store);
        break;
      default:
        throw new Error("Unknown action");
    }
    return toAdminSnapshot(store);
  });
}
