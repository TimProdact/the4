import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STORE_PATH = join(ROOT, 'data', 'bot-store.json');

const VITRINA_BASE = process.env.THE4_VITRINA_URL || 'https://timprodact.github.io/the4';
const VIP_PASSWORD = process.env.VIP_PASSWORD || 'THE4';

export const DEFAULT_BRAND = {
  name: 'THE4',
  logoEmoji: '🐱',
  logoUrl: '',
  bio: '',
  heroBgUrl: '',
  socials: {
    telegram: 'https://t.me/mundesign',
    instagram: '',
    tiktok: '',
  },
};

export const DEFAULT_PRODUCT = {
  id: 'cream-tube',
  name: 'SILK REPAIR',
  edition: 'Face Cream · 1st Drop',
  tagline: 'Питание без веса',
  price: 320_000,
  currency: 'UZS',
  mediaType: '3d',
  modelUrl: `${VITRINA_BASE}/models/gallery/cream-tube.glb`,
  images: [
    'https://images.unsplash.com/photo-1615485503744-192c76a5de68?w=1200&q=85&auto=format&fit=crop',
  ],
  colors: {
    bg: '#faf7f2',
    fg: '#2a2218',
    muted: '#9a8a78',
    accent: '#d4a574',
    btn: '#3d2e22',
    btnText: '#faf7f2',
  },
  toolbarVariant: 'light',
  modelScale: 2.6,
  cameraZ: 4.2,
};

function defaultStore() {
  const now = Date.now();
  const startsAt = process.env.DROP_STARTS_AT || new Date(now + 7 * 86_400_000).toISOString();
  return {
    product: { ...DEFAULT_PRODUCT },
    brand: { ...DEFAULT_BRAND, socials: { ...DEFAULT_BRAND.socials } },
    phase: 'pre_drop',
    stock: 14,
    totalStock: 100,
    startsAt,
    holds: {},
    lastOrderId: 1003,
    paused: false,
    manualPhase: null,
    pickupAddress: 'Ташкент, Magic City Event Hall',
    orders: [
      {
        id: 1001,
        receipt: 'THE4-1001',
        status: 'paid',
        createdAt: new Date(now - 86_400_000).toISOString(),
        buyer: {
          name: 'Демо Покупатель',
          phone: '+998 90 123 45 67',
          deliveryType: 'delivery',
          address: 'Ташкент, ул. Навои, 12',
        },
        amount: DEFAULT_PRODUCT.price,
        productName: DEFAULT_PRODUCT.name,
        edition: DEFAULT_PRODUCT.edition,
        paymentMethod: 'paylov',
      },
      {
        id: 1002,
        receipt: 'THE4-1002',
        status: 'pending',
        createdAt: new Date(now - 3_600_000).toISOString(),
        buyer: {
          name: 'Apple Pay User',
          phone: '+998 91 000 00 01',
          deliveryType: 'pickup',
          address: 'Ташкент, Magic City Event Hall',
        },
        amount: DEFAULT_PRODUCT.price,
        productName: DEFAULT_PRODUCT.name,
        edition: DEFAULT_PRODUCT.edition,
        paymentMethod: 'apple',
      },
    ],
    waitlist: [],
    onboardingComplete: true,
  };
}

function computePhase(store) {
  if (store.manualPhase) return store.manualPhase;
  if (store.paused) return store.stock <= 0 ? 'sold_out' : 'active';
  if (store.stock <= 0) return 'sold_out';
  if (Date.now() < new Date(store.startsAt).getTime()) return 'pre_drop';
  return 'active';
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
  const parsed = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
  const store = { ...defaultStore(), ...parsed, product: { ...DEFAULT_PRODUCT, ...parsed.product }, brand: { ...DEFAULT_BRAND, ...parsed.brand, socials: { ...DEFAULT_BRAND.socials, ...parsed.brand?.socials } } };
  store.phase = computePhase(store);
  return store;
}

function saveStore(store) {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  store.phase = computePhase(store);
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function toPublicDrop(store, vipOverride = false) {
  purgeHolds(store);
  const product = store.product || DEFAULT_PRODUCT;
  let phase = computePhase(store);
  if (vipOverride && phase === 'pre_drop') phase = 'active';
  return {
    phase,
    stock: store.stock,
    available: available(store),
    totalStock: store.totalStock,
    startsAt: store.startsAt,
    paused: store.paused,
    price: product.price,
    currency: product.currency || 'UZS',
    name: product.name,
    edition: product.edition,
    images: product.images?.length ? product.images : DEFAULT_PRODUCT.images,
    product,
    brand: store.brand || DEFAULT_BRAND,
  };
}

export function getPublicDrop(vipOverride = false) {
  return toPublicDrop(loadStore(), vipOverride);
}

export function getSnapshot() {
  const store = loadStore();
  purgeHolds(store);
  const product = store.product || DEFAULT_PRODUCT;
  return {
    phase: computePhase(store),
    stock: store.stock,
    available: available(store),
    totalStock: store.totalStock,
    paused: store.paused,
    startsAt: store.startsAt,
    manualPhase: store.manualPhase,
    pickupAddress: store.pickupAddress,
    product,
    brand: store.brand || DEFAULT_BRAND,
    onboardingComplete: store.onboardingComplete !== false,
    holds: Object.entries(store.holds).map(([id, h]) => ({ id, expiresAt: h.expiresAt })),
    orders: store.orders,
    waitlist: store.waitlist,
  };
}

export function runPublicAction(action, payload = {}) {
  const store = loadStore();
  purgeHolds(store);

  switch (action) {
    case 'unlock_vip': {
      if (payload.password !== VIP_PASSWORD) throw new Error('Неверный пароль');
      return { ok: true, ...toPublicDrop(store, true) };
    }
    case 'create_hold': {
      if (store.paused) {
        const err = new Error('Дроп на паузе');
        err.code = 'PAUSED';
        throw err;
      }
      if (store.stock <= 0 || available(store) <= 0) {
        const err = new Error('SOLD OUT');
        err.code = 'SOLD_OUT';
        throw err;
      }
      const holdId = crypto.randomUUID();
      const expiresAt = Date.now() + 5 * 60_000;
      store.holds[holdId] = { expiresAt };
      saveStore(store);
      return { holdId, expiresAt, ...toPublicDrop(store) };
    }
    case 'release_hold': {
      delete store.holds[payload.holdId];
      saveStore(store);
      return { ok: true, ...toPublicDrop(store) };
    }
    case 'join_waitlist': {
      const contact = String(payload.contact || '').trim();
      if (!contact) throw new Error('Укажите контакт');
      if (!store.waitlist.some(w => w.contact === contact)) {
        store.waitlist.push({ id: crypto.randomUUID(), contact, createdAt: Date.now() });
      }
      saveStore(store);
      return { ok: true, ...toPublicDrop(store) };
    }
    case 'complete_checkout': {
      const hold = store.holds[payload.holdId];
      if (!hold || hold.expiresAt < Date.now()) throw new Error('Hold истёк');
      const product = store.product || DEFAULT_PRODUCT;
      const orderId = ++store.lastOrderId;
      const receipt = `THE4-${orderId}`;
      const status = payload.paymentMethod === 'paylov' ? 'pending' : 'paid';
      store.orders.push({
        id: orderId,
        receipt,
        status,
        createdAt: new Date().toISOString(),
        buyer: {
          name: payload.name,
          phone: payload.phone,
          deliveryType: payload.deliveryType,
          address: payload.address,
        },
        amount: payload.amount || product.price,
        productName: product.name,
        edition: product.edition,
        paymentMethod: payload.paymentMethod || 'paylov',
      });
      if (status === 'paid') store.stock = Math.max(0, store.stock - 1);
      delete store.holds[payload.holdId];
      saveStore(store);
      return { ok: true, orderId, receipt, status, ...toPublicDrop(store) };
    }
    default:
      throw new Error('Неизвестное действие');
  }
}

export function runAction(action, payload = {}) {
  const store = loadStore();
  purgeHolds(store);
  const product = store.product || DEFAULT_PRODUCT;

  switch (action) {
    case 'update_brand': {
      const b = payload.brand || {};
      store.brand = {
        ...(store.brand || DEFAULT_BRAND),
        ...b,
        socials: { ...(store.brand?.socials || DEFAULT_BRAND.socials), ...(b.socials || {}) },
      };
      break;
    }
    case 'update_product': {
      const p = payload.product || {};
      store.product = {
        ...product,
        ...p,
        price: Number(p.price ?? product.price),
        images: Array.isArray(p.images) ? p.images : product.images,
      };
      break;
    }
    case 'launch_drop': {
      const p = payload.product || {};
      const modelPatch = p.mediaType === 'images'
        ? { mediaType: 'images', images: p.images || product.images }
        : {
            id: p.id || product.id,
            mediaType: '3d',
            modelUrl: p.modelUrl || product.modelUrl,
          };
      store.product = {
        ...product,
        ...modelPatch,
        name: String(payload.name || product.name).trim(),
        price: Number(payload.price ?? product.price),
        edition: payload.edition || product.edition || '1st Drop',
      };
      store.startsAt = String(payload.startsAt || store.startsAt);
      const total = Number(payload.totalStock ?? payload.stock ?? store.totalStock);
      const stock = Number(payload.stock ?? total);
      store.totalStock = total;
      store.stock = Math.min(stock, total);
      store.paused = false;
      store.manualPhase = null;
      store.onboardingComplete = true;
      break;
    }
    case 'set_starts_at':
      store.startsAt = String(payload.startsAt || store.startsAt);
      store.manualPhase = null;
      break;
    case 'set_manual_phase':
      store.manualPhase = payload.phase || null;
      break;
    case 'set_stock': {
      const stock = Number(payload.stock);
      if (!Number.isFinite(stock) || stock < 0) throw new Error('Некорректный stock');
      store.stock = Math.min(stock, store.totalStock);
      break;
    }
    case 'set_total_stock': {
      const total = Number(payload.totalStock);
      if (!Number.isFinite(total) || total < 0) throw new Error('Некорректный totalStock');
      store.totalStock = total;
      store.stock = Math.min(store.stock, total);
      break;
    }
    case 'set_paused':
      store.paused = Boolean(payload.paused);
      break;
    case 'clear_holds':
      store.holds = {};
      break;
    case 'mark_order': {
      const order = store.orders.find(o => o.id === Number(payload.orderId));
      if (!order) throw new Error('Заказ не найден');
      const prev = order.status;
      order.status = payload.status;
      if (prev === 'paid' && order.status === 'refunded') {
        store.stock = Math.min(store.totalStock, store.stock + 1);
      }
      break;
    }
    case 'confirm_pending': {
      const order = store.orders.find(o => o.id === Number(payload.orderId));
      if (!order) throw new Error('Заказ не найден');
      order.status = 'paid';
      break;
    }
    default:
      throw new Error('Неизвестное действие');
  }

  saveStore(store);
  return getSnapshot();
}
