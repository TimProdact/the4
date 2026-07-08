import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const STORE_PATH = join(ROOT, 'data', 'bot-store.json');

const VITRINA_BASE = process.env.THE4_VITRINA_URL || 'https://timprodact.github.io/the4';
const VIP_PASSWORD = process.env.VIP_PASSWORD || 'THE4';

export const FIXED_SOCIAL_PLATFORMS = [
  'instagram',
  'telegram',
  'tiktok',
  'youtube',
  'twitter',
  'website',
];

export const DEFAULT_STOREFRONT = {
  displayName: 'THE4',
  bio: '',
  avatarUrl: '',
  logoEmoji: '🐱',
  heroBgUrl: '',
  isPublished: true,
  socialLinks: [],
};

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
  visible: true,
  sortOrder: 0,
};

function newId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function normalizeSocialLinks(links = []) {
  const byPlatform = new Map();
  for (const link of links || []) {
    if (link?.platform && !byPlatform.has(link.platform)) {
      byPlatform.set(link.platform, link);
    }
  }
  return FIXED_SOCIAL_PLATFORMS.map((platform, index) => {
    const existing = byPlatform.get(platform);
    return {
      id: existing?.id || `social_${platform}`,
      platform,
      url: existing?.url || '',
      visible: existing?.visible !== false,
      clicks: Number(existing?.clicks) || 0,
      sort_order: index,
      title: existing?.title || '',
    };
  });
}

function legacySocialsToLinks(brand = {}) {
  const links = [];
  for (const platform of ['instagram', 'telegram', 'tiktok', 'youtube', 'twitter', 'website']) {
    const url = brand.socials?.[platform] || '';
    if (url) links.push({ id: `social_${platform}`, platform, url, visible: true });
  }
  return normalizeSocialLinks(links);
}

function defaultStore() {
  const now = Date.now();
  const startsAt = process.env.DROP_STARTS_AT || new Date(now + 7 * 86_400_000).toISOString();
  const product = { ...DEFAULT_PRODUCT, id: 'prod-1' };
  return {
    storefront: {
      ...DEFAULT_STOREFRONT,
      displayName: product.name,
      socialLinks: legacySocialsToLinks(DEFAULT_BRAND),
    },
    products: [product],
    drops: [{
      id: 'drop-1',
      productId: product.id,
      startsAt,
      stock: 14,
      totalStock: 100,
      paused: false,
      manualPhase: null,
    }],
    activeDropId: 'drop-1',
    holdsByDrop: {},
    lastOrderId: 1003,
    pickupAddress: 'Ташкент, Magic City Event Hall',
    orders: [
      {
        id: 1001,
        receipt: 'THE4-1001',
        status: 'paid',
        createdAt: new Date(now - 86_400_000).toISOString(),
        dropId: 'drop-1',
        productId: product.id,
        buyer: {
          name: 'Демо Покупатель',
          phone: '+998 90 123 45 67',
          deliveryType: 'delivery',
          address: 'Ташкент, ул. Навои, 12',
        },
        amount: product.price,
        productName: product.name,
        edition: product.edition,
        paymentMethod: 'paylov',
      },
      {
        id: 1002,
        receipt: 'THE4-1002',
        status: 'pending',
        createdAt: new Date(now - 3_600_000).toISOString(),
        dropId: 'drop-1',
        productId: product.id,
        buyer: {
          name: 'Apple Pay User',
          phone: '+998 91 000 00 01',
          deliveryType: 'pickup',
          address: 'Ташкент, Magic City Event Hall',
        },
        amount: product.price,
        productName: product.name,
        edition: product.edition,
        paymentMethod: 'apple',
      },
    ],
    waitlist: [],
    onboardingComplete: true,
  };
}

function computeDropPhase(drop) {
  if (drop.manualPhase) return drop.manualPhase;
  if (drop.paused) return drop.stock <= 0 ? 'sold_out' : 'active';
  if (drop.stock <= 0) return 'sold_out';
  if (Date.now() < new Date(drop.startsAt).getTime()) return 'pre_drop';
  return 'active';
}

function purgeHoldsForDrop(store, dropId) {
  const holds = store.holdsByDrop?.[dropId] || {};
  const now = Date.now();
  for (const [id, h] of Object.entries(holds)) {
    if (h.expiresAt <= now) delete holds[id];
  }
  store.holdsByDrop[dropId] = holds;
}

function purgeAllHolds(store) {
  store.holdsByDrop = store.holdsByDrop || {};
  for (const dropId of Object.keys(store.holdsByDrop)) {
    purgeHoldsForDrop(store, dropId);
  }
}

function availableForDrop(store, drop) {
  purgeHoldsForDrop(store, drop.id);
  const holds = store.holdsByDrop?.[drop.id] || {};
  return Math.max(0, drop.stock - Object.keys(holds).length);
}

function findProduct(store, productId) {
  return store.products?.find((p) => p.id === productId) || store.products?.[0] || { ...DEFAULT_PRODUCT };
}

function findDrop(store, dropId) {
  return store.drops?.find((d) => d.id === dropId) || store.drops?.[0];
}

function getPrimaryDrop(store) {
  return findDrop(store, store.activeDropId) || store.drops?.[0];
}

function migrateStore(parsed) {
  const base = defaultStore();
  const raw = { ...base, ...parsed };

  if (!raw.storefront) {
    const brand = { ...DEFAULT_BRAND, ...parsed.brand };
    raw.storefront = {
      displayName: brand.name || raw.products?.[0]?.name || DEFAULT_PRODUCT.name,
      bio: brand.bio || '',
      avatarUrl: brand.logoUrl || '',
      logoEmoji: brand.logoEmoji || '🐱',
      heroBgUrl: brand.heroBgUrl || '',
      isPublished: true,
      socialLinks: legacySocialsToLinks(brand),
    };
  } else {
    raw.storefront = {
      ...DEFAULT_STOREFRONT,
      ...raw.storefront,
      socialLinks: normalizeSocialLinks(raw.storefront.socialLinks),
    };
  }

  if (!Array.isArray(raw.products) || !raw.products.length) {
    const legacy = { ...DEFAULT_PRODUCT, ...parsed.product };
    raw.products = [{ ...legacy, id: legacy.id || 'prod-1', visible: legacy.visible !== false, sortOrder: 0 }];
  }

  if (!Array.isArray(raw.drops) || !raw.drops.length) {
    const productId = raw.products[0]?.id || 'prod-1';
    raw.drops = [{
      id: 'drop-1',
      productId,
      startsAt: parsed.startsAt || base.drops[0].startsAt,
      stock: parsed.stock ?? base.drops[0].stock,
      totalStock: parsed.totalStock ?? base.drops[0].totalStock,
      paused: parsed.paused ?? false,
      manualPhase: parsed.manualPhase ?? null,
    }];
  }

  if (!raw.activeDropId) raw.activeDropId = raw.drops[0]?.id;

  if (!raw.holdsByDrop) {
    raw.holdsByDrop = {};
    if (parsed.holds && Object.keys(parsed.holds).length) {
      raw.holdsByDrop[raw.activeDropId] = { ...parsed.holds };
    }
  }

  return raw;
}

function loadStore() {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  if (!existsSync(STORE_PATH)) {
    const fresh = defaultStore();
    writeFileSync(STORE_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
  const parsed = JSON.parse(readFileSync(STORE_PATH, 'utf8'));
  return migrateStore(parsed);
}

function saveStore(store) {
  mkdirSync(dirname(STORE_PATH), { recursive: true });
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

function storefrontAsBrand(storefront) {
  const socials = { telegram: '', instagram: '', tiktok: '' };
  for (const link of storefront.socialLinks || []) {
    if (link.platform in socials) socials[link.platform] = link.url || '';
  }
  return {
    name: storefront.displayName,
    logoEmoji: storefront.logoEmoji,
    logoUrl: storefront.avatarUrl,
    bio: storefront.bio,
    heroBgUrl: storefront.heroBgUrl,
    socials,
  };
}

function enrichDrop(store, drop) {
  const product = findProduct(store, drop.productId);
  const phase = computeDropPhase(drop);
  return {
    ...drop,
    phase,
    available: availableForDrop(store, drop),
    product,
    productName: product.name,
    edition: product.edition,
    price: product.price,
  };
}

function buildSnapshot(store) {
  purgeAllHolds(store);
  const primary = getPrimaryDrop(store);
  const product = findProduct(store, primary?.productId);
  const storefront = {
    ...store.storefront,
    socialLinks: normalizeSocialLinks(store.storefront?.socialLinks),
  };
  const drops = (store.drops || []).map((d) => enrichDrop(store, d));
  const primaryEnriched = drops.find((d) => d.id === primary?.id) || drops[0];

  return {
    storefront,
    products: [...(store.products || [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    drops,
    activeDropId: store.activeDropId,
    phase: primaryEnriched?.phase,
    stock: primaryEnriched?.stock,
    available: primaryEnriched?.available,
    totalStock: primaryEnriched?.totalStock,
    paused: primaryEnriched?.paused,
    startsAt: primaryEnriched?.startsAt,
    manualPhase: primaryEnriched?.manualPhase,
    pickupAddress: store.pickupAddress,
    product,
    brand: storefrontAsBrand(storefront),
    socialLinks: storefront.socialLinks,
    onboardingComplete: store.onboardingComplete !== false,
    holds: Object.entries(store.holdsByDrop?.[primary?.id] || {}).map(([id, h]) => ({ id, expiresAt: h.expiresAt })),
    orders: store.orders,
    waitlist: store.waitlist,
  };
}

function toPublicDrop(store, { dropId, vipOverride = false } = {}) {
  purgeAllHolds(store);
  const drop = findDrop(store, dropId || store.activeDropId);
  const product = findProduct(store, drop.productId);
  let phase = computeDropPhase(drop);
  if (vipOverride && phase === 'pre_drop') phase = 'active';
  const storefront = store.storefront || DEFAULT_STOREFRONT;
  const drops = (store.drops || []).map((d) => {
    const p = findProduct(store, d.productId);
    return {
      id: d.id,
      productId: d.productId,
      phase: computeDropPhase(d),
      startsAt: d.startsAt,
      stock: d.stock,
      available: availableForDrop(store, d),
      paused: d.paused,
      name: p.name,
      edition: p.edition,
      price: p.price,
      currency: p.currency || 'UZS',
      images: p.images?.length ? p.images : DEFAULT_PRODUCT.images,
      mediaType: p.mediaType,
      modelUrl: p.modelUrl,
    };
  });

  return {
    dropId: drop.id,
    phase,
    stock: drop.stock,
    available: availableForDrop(store, drop),
    totalStock: drop.totalStock,
    startsAt: drop.startsAt,
    paused: drop.paused,
    price: product.price,
    currency: product.currency || 'UZS',
    name: product.name,
    edition: product.edition,
    images: product.images?.length ? product.images : DEFAULT_PRODUCT.images,
    product,
    brand: storefrontAsBrand(storefront),
    storefront: {
      displayName: storefront.displayName,
      bio: storefront.bio,
      avatarUrl: storefront.avatarUrl,
      logoEmoji: storefront.logoEmoji,
      heroBgUrl: storefront.heroBgUrl,
      socialLinks: normalizeSocialLinks(storefront.socialLinks).filter((l) => l.visible && l.url),
    },
    drops,
    products: (store.products || []).filter((p) => p.visible !== false),
  };
}

export function getPublicDrop(vipOverride = false, dropId) {
  return toPublicDrop(loadStore(), { vipOverride, dropId });
}

export function getPublicStorefront() {
  return toPublicDrop(loadStore());
}

export function getSnapshot() {
  return buildSnapshot(loadStore());
}

export function runPublicAction(action, payload = {}) {
  const store = loadStore();
  purgeAllHolds(store);
  const dropId = payload.dropId || store.activeDropId;
  const drop = findDrop(store, dropId);
  if (!drop && action !== 'unlock_vip') throw new Error('Дроп не найден');

  switch (action) {
    case 'unlock_vip': {
      if (payload.password !== VIP_PASSWORD) throw new Error('Неверный пароль');
      return { ok: true, ...toPublicDrop(store, { dropId, vipOverride: true }) };
    }
    case 'create_hold': {
      if (drop.paused) {
        const err = new Error('Дроп на паузе');
        err.code = 'PAUSED';
        throw err;
      }
      if (drop.stock <= 0 || availableForDrop(store, drop) <= 0) {
        const err = new Error('SOLD OUT');
        err.code = 'SOLD_OUT';
        throw err;
      }
      const holdId = crypto.randomUUID();
      const expiresAt = Date.now() + 5 * 60_000;
      store.holdsByDrop[drop.id] = store.holdsByDrop[drop.id] || {};
      store.holdsByDrop[drop.id][holdId] = { expiresAt };
      saveStore(store);
      return { holdId, expiresAt, ...toPublicDrop(store, { dropId: drop.id }) };
    }
    case 'release_hold': {
      delete store.holdsByDrop[drop.id]?.[payload.holdId];
      saveStore(store);
      return { ok: true, ...toPublicDrop(store, { dropId: drop.id }) };
    }
    case 'join_waitlist': {
      const contact = String(payload.contact || '').trim();
      if (!contact) throw new Error('Укажите контакт');
      if (!store.waitlist.some((w) => w.contact === contact)) {
        store.waitlist.push({ id: crypto.randomUUID(), contact, dropId: drop.id, createdAt: Date.now() });
      }
      saveStore(store);
      return { ok: true, ...toPublicDrop(store, { dropId: drop.id }) };
    }
    case 'complete_checkout': {
      const holds = store.holdsByDrop[drop.id] || {};
      const hold = holds[payload.holdId];
      if (!hold || hold.expiresAt < Date.now()) throw new Error('Hold истёк');
      const product = findProduct(store, drop.productId);
      const orderId = ++store.lastOrderId;
      const receipt = `THE4-${orderId}`;
      const status = payload.paymentMethod === 'paylov' ? 'pending' : 'paid';
      store.orders.push({
        id: orderId,
        receipt,
        status,
        createdAt: new Date().toISOString(),
        dropId: drop.id,
        productId: product.id,
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
      if (status === 'paid') drop.stock = Math.max(0, drop.stock - 1);
      delete store.holdsByDrop[drop.id][payload.holdId];
      saveStore(store);
      return { ok: true, orderId, receipt, status, ...toPublicDrop(store, { dropId: drop.id }) };
    }
    default:
      throw new Error('Неизвестное действие');
  }
}

function resolveDrop(store, dropId) {
  const drop = findDrop(store, dropId || store.activeDropId);
  if (!drop) throw new Error('Дроп не найден');
  return drop;
}

export function runAction(action, payload = {}) {
  const store = loadStore();
  purgeAllHolds(store);

  switch (action) {
    case 'update_storefront':
    case 'update_brand': {
      const input = payload.storefront || payload.brand || {};
      const prev = store.storefront || DEFAULT_STOREFRONT;
      if (payload.brand && !payload.storefront) {
        store.storefront = {
          ...prev,
          displayName: input.name ?? prev.displayName,
          bio: input.bio ?? prev.bio,
          avatarUrl: input.logoUrl ?? prev.avatarUrl,
          logoEmoji: input.logoEmoji ?? prev.logoEmoji,
          heroBgUrl: input.heroBgUrl ?? prev.heroBgUrl,
          socialLinks: input.socials
            ? legacySocialsToLinks({ socials: input.socials })
            : prev.socialLinks,
        };
      } else {
        store.storefront = {
          ...prev,
          ...input,
          socialLinks: input.socialLinks
            ? normalizeSocialLinks(input.socialLinks)
            : prev.socialLinks,
        };
      }
      break;
    }
    case 'update_social_links': {
      store.storefront = {
        ...(store.storefront || DEFAULT_STOREFRONT),
        socialLinks: normalizeSocialLinks(payload.socialLinks),
      };
      break;
    }
    case 'create_product': {
      const p = payload.product || {};
      const product = {
        ...DEFAULT_PRODUCT,
        ...p,
        id: p.id || newId('prod'),
        price: Number(p.price ?? DEFAULT_PRODUCT.price),
        visible: p.visible !== false,
        sortOrder: store.products.length,
      };
      store.products.push(product);
      break;
    }
    case 'update_product': {
      const productId = payload.productId || payload.product?.id;
      const idx = store.products.findIndex((p) => p.id === productId);
      const p = payload.product || {};
      if (idx === -1) {
        store.products.push({
          ...DEFAULT_PRODUCT,
          ...p,
          id: productId || newId('prod'),
          price: Number(p.price ?? DEFAULT_PRODUCT.price),
        });
      } else {
        store.products[idx] = {
          ...store.products[idx],
          ...p,
          price: Number(p.price ?? store.products[idx].price),
          images: Array.isArray(p.images) ? p.images : store.products[idx].images,
        };
      }
      break;
    }
    case 'delete_product': {
      if (store.products.length <= 1) throw new Error('Нельзя удалить последний товар');
      const productId = payload.productId;
      store.products = store.products.filter((p) => p.id !== productId);
      store.drops = store.drops.filter((d) => d.productId !== productId);
      if (!store.drops.length) {
        store.drops.push({
          id: newId('drop'),
          productId: store.products[0].id,
          startsAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
          stock: 0,
          totalStock: 100,
          paused: false,
          manualPhase: null,
        });
      }
      if (!store.products.find((p) => p.id === findDrop(store, store.activeDropId)?.productId)) {
        store.activeDropId = store.drops[0].id;
      }
      break;
    }
    case 'create_drop': {
      const productId = payload.productId || store.products[0]?.id;
      if (!productId) throw new Error('Выберите товар');
      const drop = {
        id: newId('drop'),
        productId,
        startsAt: payload.startsAt || new Date(Date.now() + 7 * 86_400_000).toISOString(),
        stock: Number(payload.stock ?? payload.totalStock ?? 100),
        totalStock: Number(payload.totalStock ?? payload.stock ?? 100),
        paused: false,
        manualPhase: null,
      };
      store.drops.push(drop);
      store.activeDropId = drop.id;
      break;
    }
    case 'launch_drop': {
      const productId = payload.productId;
      let product = productId ? findProduct(store, productId) : null;
      if (payload.name || payload.price || payload.product) {
        const p = payload.product || {};
        if (product) {
          const idx = store.products.findIndex((x) => x.id === product.id);
          store.products[idx] = {
            ...product,
            ...p,
            name: String(payload.name || product.name).trim(),
            price: Number(payload.price ?? product.price),
          };
          product = store.products[idx];
        } else {
          product = {
            ...DEFAULT_PRODUCT,
            ...p,
            id: newId('prod'),
            name: String(payload.name || DEFAULT_PRODUCT.name).trim(),
            price: Number(payload.price ?? DEFAULT_PRODUCT.price),
            edition: payload.edition || '1st Drop',
          };
          store.products.push(product);
        }
      }
      if (!product) product = store.products[0];
      const drop = {
        id: newId('drop'),
        productId: product.id,
        startsAt: String(payload.startsAt || new Date(Date.now() + 7 * 86_400_000).toISOString()),
        stock: Number(payload.stock ?? payload.totalStock ?? 100),
        totalStock: Number(payload.totalStock ?? payload.stock ?? 100),
        paused: false,
        manualPhase: null,
      };
      store.drops.push(drop);
      store.activeDropId = drop.id;
      store.onboardingComplete = true;
      break;
    }
    case 'set_active_drop':
      store.activeDropId = payload.dropId;
      break;
    case 'set_starts_at': {
      const drop = resolveDrop(store, payload.dropId);
      drop.startsAt = String(payload.startsAt || drop.startsAt);
      drop.manualPhase = null;
      break;
    }
    case 'set_manual_phase': {
      const drop = resolveDrop(store, payload.dropId);
      drop.manualPhase = payload.phase || null;
      break;
    }
    case 'set_stock': {
      const drop = resolveDrop(store, payload.dropId);
      const stock = Number(payload.stock);
      if (!Number.isFinite(stock) || stock < 0) throw new Error('Некорректный stock');
      drop.stock = Math.min(stock, drop.totalStock);
      break;
    }
    case 'set_total_stock': {
      const drop = resolveDrop(store, payload.dropId);
      const total = Number(payload.totalStock);
      if (!Number.isFinite(total) || total < 0) throw new Error('Некорректный totalStock');
      drop.totalStock = total;
      drop.stock = Math.min(drop.stock, total);
      break;
    }
    case 'set_paused': {
      const drop = resolveDrop(store, payload.dropId);
      drop.paused = Boolean(payload.paused);
      break;
    }
    case 'clear_holds': {
      const drop = resolveDrop(store, payload.dropId);
      store.holdsByDrop[drop.id] = {};
      break;
    }
    case 'mark_order': {
      const order = store.orders.find((o) => o.id === Number(payload.orderId));
      if (!order) throw new Error('Заказ не найден');
      const prev = order.status;
      order.status = payload.status;
      if (prev === 'paid' && order.status === 'refunded') {
        const drop = findDrop(store, order.dropId);
        if (drop) drop.stock = Math.min(drop.totalStock, drop.stock + 1);
      }
      break;
    }
    case 'confirm_pending': {
      const order = store.orders.find((o) => o.id === Number(payload.orderId));
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
