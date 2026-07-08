import { isValid, parse } from '@telegram-apps/init-data-node';

const STORE_KEY = 'drop';
const ADMINS_KEY = 'admins';

const DROP = {
  totalStock: 100,
  startsAt: '2020-01-01T00:00:00.000Z',
  price: 320_000,
  edition: 'Face Cream · 1st Drop',
  pickupAddress: 'Ташкент, Magic City Event Hall',
};

function defaultStore() {
  const now = Date.now();
  return {
    phase: 'active',
    stock: 14,
    totalStock: DROP.totalStock,
    startsAt: DROP.startsAt,
    holds: {},
    paused: false,
    orders: [
      {
        id: 1001,
        receipt: 'THE4-1001',
        status: 'paid',
        createdAt: new Date(now - 86_400_000).toISOString(),
        buyer: { name: 'Демо Покупатель', phone: '+998 90 123 45 67', deliveryType: 'delivery', address: 'Ташкент, ул. Навои, 12' },
        amount: DROP.price,
        productName: 'SILK REPAIR',
        edition: DROP.edition,
        paymentMethod: 'paylov',
      },
      {
        id: 1002,
        receipt: 'THE4-1002',
        status: 'pending',
        createdAt: new Date(now - 3_600_000).toISOString(),
        buyer: { name: 'Apple Pay User', phone: '+998 91 000 00 01', deliveryType: 'pickup', address: DROP.pickupAddress },
        amount: 420_000,
        productName: 'PULSE TINT',
        edition: 'Lip Oil',
        paymentMethod: 'apple',
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
  if (store.paused) return store.stock <= 0 ? 'sold_out' : 'active';
  if (store.stock <= 0) return 'sold_out';
  if (Date.now() < new Date(store.startsAt).getTime()) return 'pre_drop';
  return 'active';
}

function purgeHolds(store) {
  const now = Date.now();
  for (const [id, h] of Object.entries(store.holds || {})) {
    if (h.expiresAt <= now) delete store.holds[id];
  }
}

function available(store) {
  purgeHolds(store);
  return Math.max(0, store.stock - Object.keys(store.holds || {}).length);
}

function toSnapshot(store) {
  purgeHolds(store);
  return {
    phase: store.phase,
    stock: store.stock,
    available: available(store),
    totalStock: store.totalStock,
    paused: store.paused,
    startsAt: store.startsAt,
    holds: Object.entries(store.holds || {}).map(([id, h]) => ({ id, expiresAt: h.expiresAt })),
    orders: store.orders || [],
    waitlist: store.waitlist || [],
    analytics: store.analytics || defaultStore().analytics,
  };
}

async function loadStore(env) {
  const raw = await env.THE4_STORE.get(STORE_KEY);
  let store = raw ? { ...defaultStore(), ...JSON.parse(raw) } : defaultStore();
  store.phase = computePhase(store);
  return store;
}

async function saveStore(env, store) {
  store.phase = computePhase(store);
  await env.THE4_STORE.put(STORE_KEY, JSON.stringify(store));
}

async function getAdmins(env) {
  const raw = await env.THE4_STORE.get(ADMINS_KEY);
  const fromEnv = (env.TELEGRAM_ADMIN_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
  const fromKv = raw ? JSON.parse(raw) : [];
  return [...new Set([...fromEnv, ...fromKv.map(String)])];
}

async function isAdmin(env, telegramId) {
  const admins = await getAdmins(env);
  return admins.includes(String(telegramId));
}

async function grantAdmin(env, telegramId) {
  const raw = await env.THE4_STORE.get(ADMINS_KEY);
  const list = raw ? JSON.parse(raw) : [];
  const id = String(telegramId);
  if (!list.includes(id)) {
    list.push(id);
    await env.THE4_STORE.put(ADMINS_KEY, JSON.stringify(list));
  }
}

async function runAction(env, action, payload = {}) {
  const store = await loadStore(env);
  purgeHolds(store);

  switch (action) {
    case 'set_stock': {
      const stock = Number(payload.stock);
      if (!Number.isFinite(stock) || stock < 0) throw new Error('Некорректный stock');
      store.stock = Math.min(stock, store.totalStock);
      break;
    }
    case 'set_paused':
      store.paused = Boolean(payload.paused);
      break;
    case 'clear_holds':
      store.holds = {};
      break;
    case 'set_starts_at':
      store.startsAt = String(payload.startsAt || DROP.startsAt);
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
    case 'reset_demo':
      Object.assign(store, defaultStore());
      break;
    case 'reset_analytics':
      store.analytics = defaultStore().analytics;
      break;
    default:
      throw new Error('Неизвестное действие');
  }

  await saveStore(env, store);
  return toSnapshot(store);
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

function json(status, body) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders() });
}

async function authUser(body, env) {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) throw Object.assign(new Error('Bot not configured'), { status: 500 });
  const parsed = validateInitData(body.initData, token);
  if (!parsed) throw Object.assign(new Error('Invalid Telegram session'), { status: 401 });
  if (!(await isAdmin(env, parsed.user.id))) {
    throw Object.assign(
      new Error('Нет доступа. Войди в бота: /login пароль'),
      { status: 403 },
    );
  }
  return parsed.user;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }
    if (request.method !== 'POST') return json(405, { error: 'POST only' });

    try {
      const body = await request.json();

      if (body.action === 'grant_admin') {
        if (body.secret !== (env.ADMIN_PASSWORD || 'THE4ADMIN')) {
          return json(403, { error: 'Forbidden' });
        }
        await grantAdmin(env, body.telegramId);
        return json(200, { ok: true });
      }

      const user = await authUser(body, env);

      if (body.action === 'bootstrap') {
        const snapshot = toSnapshot(await loadStore(env));
        return json(200, { snapshot, firstName: user.first_name, telegramId: user.id });
      }

      if (body.action === 'admin_action') {
        const snapshot = await runAction(env, body.adminAction, body.payload || {});
        return json(200, { snapshot });
      }

      return json(400, { error: 'Unknown action' });
    } catch (e) {
      const status = e.status || 500;
      return json(status, { error: e.message || 'Server error' });
    }
  },
};
