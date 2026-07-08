import { DROP_CONFIG, refreshPhase as applyPhase } from "./drop-config";
import { assertThemePurchasable, reserveThemeStock } from "./theme-drop-status";
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
  holds: Record<string, { expiresAt: number; themeId?: string }>;
  lastOrderId: number;
  paused: boolean;
  orders: Order[];
  waitlist: WaitlistEntry[];
}

const STORAGE_KEY = "the4_store_v1";
const ADMIN_TOKENS_KEY = "the4_admin_tokens_v1";
const listeners = new Set<(snap: DropSnapshot) => void>();
const adminTokens = new Set<string>();

function loadAdminTokens(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(ADMIN_TOKENS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistAdminToken(token: string) {
  const tokens = loadAdminTokens();
  tokens.add(token);
  adminTokens.add(token);
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_TOKENS_KEY, JSON.stringify([...tokens]));
  }
}

function hydrateAdminTokens() {
  for (const token of loadAdminTokens()) {
    adminTokens.add(token);
  }
}

if (typeof window !== "undefined") {
  hydrateAdminTokens();
}

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

function ensureDemoSeed(store: InternalStore) {
  if (store.orders.length > 0) return;
  const now = Date.now();
  store.orders = [
    {
      id: 1001,
      receipt: "THE4-1001",
      status: "paid",
      createdAt: new Date(now - 86_400_000).toISOString(),
      buyer: {
        name: "Демо Покупатель",
        phone: "+998 90 123 45 67",
        deliveryType: "delivery",
        address: "Ташкент, ул. Навои, 12",
      },
      amount: DROP_CONFIG.price,
      productName: DROP_CONFIG.name,
      edition: DROP_CONFIG.edition,
      paymentMethod: "paylov",
    },
    {
      id: 1002,
      receipt: "THE4-1002",
      status: "pending",
      createdAt: new Date(now - 3_600_000).toISOString(),
      buyer: {
        name: "Apple Pay User",
        phone: "+998 91 000 00 01",
        deliveryType: "pickup",
        address: DROP_CONFIG.pickupAddress,
      },
      amount: 420_000,
      productName: "PULSE TINT",
      edition: "Lip Oil",
      paymentMethod: "apple",
    },
    {
      id: 1003,
      receipt: "THE4-1003",
      status: "failed",
      createdAt: new Date(now - 7_200_000).toISOString(),
      buyer: {
        name: "Google Pay User",
        phone: "+998 93 111 22 33",
        deliveryType: "delivery",
        address: "Ташкент, Мирабад",
      },
      amount: 666_000,
      productName: "MIDNIGHT PEEL",
      edition: "Exfoliating Mask",
      paymentMethod: "google",
    },
  ];
  store.lastOrderId = 1003;
}

function loadStore(): InternalStore {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = defaultStore();
      ensureDemoSeed(fresh);
      saveStore(fresh);
      return fresh;
    }
    const store = { ...defaultStore(), ...JSON.parse(raw) };
    const hadOrders = store.orders.length;
    ensureDemoSeed(store);
    if (!hadOrders && store.orders.length > 0) saveStore(store);
    return store;
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

export function createHoldClient(themeId?: string) {
  return withStore(store => {
    purgeExpiredHolds(store);

    if (store.paused) {
      const err = new Error("Дроп на паузе") as Error & { code?: string };
      err.code = "PAUSED";
      throw err;
    }

    if (themeId) {
      assertThemePurchasable(themeId);
    } else {
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
    }

    const holdId = uuid();
    const expiresAt = Date.now() + DROP_CONFIG.holdMinutes * 60_000;
    store.holds[holdId] = { expiresAt, themeId };
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
  productName?: string;
  edition?: string;
  amount?: number;
  themeId?: string;
}): Promise<CheckoutResult> {
  const {
    holdId,
    holdExpiresAt,
    name,
    phone,
    deliveryType,
    address,
    paymentMethod = "paylov",
    productName,
    edition,
    amount = DROP_CONFIG.price,
    themeId,
  } = payload;

  const store = loadStore();
  purgeExpiredHolds(store);

  const serverHold = holdId ? store.holds[holdId] : null;
  const expiresAt = serverHold?.expiresAt ?? holdExpiresAt;
  const checkoutThemeId = themeId ?? serverHold?.themeId;

  if (!holdId || !expiresAt || expiresAt < Date.now()) {
    const err = new Error("Резерв истёк. Нажмите BUY NOW снова.") as Error & { code?: string };
    err.code = "HOLD_EXPIRED";
    throw err;
  }

  if (checkoutThemeId) {
    try {
      assertThemePurchasable(checkoutThemeId);
    } catch (e) {
      const err = e as Error & { code?: string };
      if (err.code === "SOLD_OUT") {
        err.code = "RACE_LOST";
        err.message = "Кто-то успел раньше. SOLD OUT.";
      }
      throw err;
    }
  } else if (store.stock <= 0) {
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
      amount,
      productName,
      edition,
      paymentMethod,
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
  if (checkoutThemeId) {
    reserveThemeStock(checkoutThemeId);
  }
  if (store.stock > 0) {
    store.stock -= 1;
  }
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
    amount,
    productName,
    edition,
    paymentMethod,
  });

  saveStore(store);
  notify(store);

  return {
    ok: true,
    orderId,
    receipt,
    status,
  };
}

export function getStoreOrders(): Order[] {
  return [...loadStore().orders];
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

export function isOnWaitlistClient(contact: string): boolean {
  const trimmed = contact.trim();
  if (!trimmed) return false;
  const digits = trimmed.replace(/\D/g, "");
  return loadStore().waitlist.some(w => {
    if (w.contact === trimmed) return true;
    const wd = w.contact.replace(/\D/g, "");
    return digits.length >= 9 && wd === digits;
  });
}

export function adminLoginClient(password: string): string {
  if (password !== DROP_CONFIG.adminPassword) {
    throw new Error("Неверный пароль");
  }
  const token = `adm-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  persistAdminToken(token);
  return token;
}

function assertAdmin(token: string) {
  if (!adminTokens.has(token)) {
    const saved = loadAdminTokens();
    if (!saved.has(token)) throw new Error("Unauthorized");
    adminTokens.add(token);
  }
}

export function adminLogoutClient(token: string) {
  adminTokens.delete(token);
  const saved = loadAdminTokens();
  saved.delete(token);
  if (typeof window !== "undefined") {
    localStorage.setItem(ADMIN_TOKENS_KEY, JSON.stringify([...saved]));
  }
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
        const prev = order.status;
        order.status = payload.status as OrderStatus;
        if (prev === "paid" && order.status === "refunded") {
          store.stock = Math.min(store.totalStock, store.stock + 1);
          applyPhase(store);
        }
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
