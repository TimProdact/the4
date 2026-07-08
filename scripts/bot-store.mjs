import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const STORE_PATH = join(ROOT, "data", "bot-store.json");

const DROP = {
  name: "SILK REPAIR",
  edition: "Face Cream · 1st Drop",
  price: 320_000,
  totalStock: 100,
  startsAt: process.env.DROP_STARTS_AT || "2020-01-01T00:00:00.000Z",
  pickupAddress: "Ташкент, Magic City Event Hall",
};

function defaultStore() {
  const now = Date.now();
  return {
    phase: "active",
    stock: 14,
    totalStock: DROP.totalStock,
    startsAt: DROP.startsAt,
    holds: {},
    lastOrderId: 1003,
    paused: false,
    orders: [
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
        amount: DROP.price,
        productName: DROP.name,
        edition: DROP.edition,
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
          address: DROP.pickupAddress,
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
    ],
    waitlist: [],
    analytics: {
      dropViews: 128,
      buyNowClicks: 34,
      checkoutOpens: 22,
      checkoutHolds: 15,
      checkoutPaid: 8,
      holdExpired: 3,
      raceLost: 2,
      checkoutFailed: 1,
    },
  };
}

function computePhase(store) {
  if (store.paused) return store.stock <= 0 ? "sold_out" : "active";
  if (store.stock <= 0) return "sold_out";
  if (Date.now() < new Date(store.startsAt).getTime()) return "pre_drop";
  return "active";
}

function purgeHolds(store) {
  const now = Date.now();
  for (const [id, h] of Object.entries(store.holds)) {
    if (h.expiresAt <= now) delete store.holds[id];
  }
}

function available(store) {
  purgeHolds(store);
  return Math.max(0, store.stock - Object.keys(store.holds).length);
}

function loadStore() {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  if (!existsSync(STORE_PATH)) {
    const fresh = defaultStore();
    fresh.phase = computePhase(fresh);
    writeFileSync(STORE_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
  const store = { ...defaultStore(), ...JSON.parse(readFileSync(STORE_PATH, "utf8")) };
  store.phase = computePhase(store);
  return store;
}

function saveStore(store) {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  store.phase = computePhase(store);
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

export function getSnapshot() {
  const store = loadStore();
  purgeHolds(store);
  return {
    phase: store.phase,
    stock: store.stock,
    available: available(store),
    totalStock: store.totalStock,
    paused: store.paused,
    startsAt: store.startsAt,
    holds: Object.entries(store.holds).map(([id, h]) => ({ id, expiresAt: h.expiresAt })),
    orders: store.orders,
    waitlist: store.waitlist,
    analytics: store.analytics || defaultStore().analytics,
  };
}

export function runAction(action, payload = {}) {
  const store = loadStore();
  purgeHolds(store);

  switch (action) {
    case "set_stock": {
      const stock = Number(payload.stock);
      if (!Number.isFinite(stock) || stock < 0) throw new Error("Некорректный stock");
      store.stock = Math.min(stock, store.totalStock);
      break;
    }
    case "set_paused":
      store.paused = Boolean(payload.paused);
      break;
    case "clear_holds":
      store.holds = {};
      break;
    case "set_starts_at":
      store.startsAt = String(payload.startsAt || DROP.startsAt);
      break;
    case "mark_order": {
      const order = store.orders.find(o => o.id === Number(payload.orderId));
      if (!order) throw new Error("Заказ не найден");
      const prev = order.status;
      order.status = payload.status;
      if (prev === "paid" && order.status === "refunded") {
        store.stock = Math.min(store.totalStock, store.stock + 1);
      }
      break;
    }
    case "confirm_pending": {
      const order = store.orders.find(o => o.id === Number(payload.orderId));
      if (!order) throw new Error("Заказ не найден");
      order.status = "paid";
      break;
    }
    case "reset_demo":
      Object.assign(store, defaultStore());
      break;
    case "reset_analytics":
      store.analytics = defaultStore().analytics;
      break;
    default:
      throw new Error("Неизвестное действие");
  }

  saveStore(store);
  return getSnapshot();
}
