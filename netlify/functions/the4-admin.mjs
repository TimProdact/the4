import { validateInitData } from '../../bot/telegram-auth.mjs';
import {
  initBlobs,
  getSnapshot,
  runAction,
  isAdmin,
  grantAdmin,
} from '../../bot/admin-store.mjs';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

function json(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}

async function authUser(body) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw Object.assign(new Error('Bot not configured'), { status: 500 });
  const parsed = validateInitData(body.initData, token);
  if (!parsed) throw Object.assign(new Error('Invalid Telegram session'), { status: 401 });
  if (!(await isAdmin(parsed.user.id))) {
    throw Object.assign(
      new Error('Нет доступа. Войди в бота: /login пароль, или добавь TELEGRAM_ADMIN_IDS'),
      { status: 403 },
    );
  }
  return parsed.user;
}

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return json(405, { error: 'POST only' });

  try {
    initBlobs(event);
    const body = JSON.parse(event.body || '{}');

    if (body.action === 'grant_admin') {
      const secret = process.env.ADMIN_PASSWORD || 'THE4ADMIN';
      if (body.secret !== secret) return json(403, { error: 'Forbidden' });
      await grantAdmin(body.telegramId);
      return json(200, { ok: true });
    }

    const user = await authUser(body);

    if (body.action === 'bootstrap') {
      const snapshot = await getSnapshot();
      return json(200, {
        snapshot,
        firstName: user.first_name,
        telegramId: user.id,
      });
    }

    if (body.action === 'admin_action') {
      const snapshot = await runAction(body.adminAction, body.payload || {});
      return json(200, { snapshot });
    }

    return json(400, { error: 'Unknown action' });
  } catch (e) {
    const status = e.status || 500;
    if (status >= 500) console.error('the4-admin', e);
    return json(status, { error: e.message || 'Server error' });
  }
}
