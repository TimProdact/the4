import { getSnapshot, grantAdminId, isAdminId, runAction } from './bot-store.mjs';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'THE4ADMIN';
const MINI_APP_URL = process.env.THE4_MINI_APP_URL || 'https://timprodact.github.io/the4/admin/mini-app-dist/';
const ADMIN_URL = 'https://timprodact.github.io/the4/admin/';

function miniAppKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📱 Открыть админку', web_app: { url: MINI_APP_URL } }],
    ],
  };
}

function fmtSnapshot(s) {
  const holds = s.holds?.length || 0;
  const ordersPaid = (s.orders || []).filter((o) => o.status === 'paid').length;
  const ordersPending = (s.orders || []).filter((o) => o.status === 'pending').length;
  return [
    '<b>Pocket Pals · статус</b>',
    `Фаза: <b>${s.phase || '—'}</b>${s.paused ? ' (пауза)' : ''}`,
    `Сток: <b>${s.available ?? '—'}</b> / ${s.stock ?? '—'}`,
    `Заказы: paid ${ordersPaid} · pending ${ordersPending}`,
    `Waitlist: ${(s.waitlist || []).length}`,
  ].join('\n');
}

function helpText() {
  return [
    '<b>Команды</b>',
    '/start — открыть админку',
    `/login ${ADMIN_PASSWORD} — получить доступ`,
    '/status — статус дропа',
    '/help — справка',
  ].join('\n');
}

export async function sendTelegramMessage(token, chatId, text, extra = {}) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extra,
    }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'Telegram API error');
  return data.result;
}

export async function handleTelegramCommand(token, chatId, userId, text) {
  const [cmd, ...args] = text.trim().split(/\s+/);
  const lower = cmd.toLowerCase();

  if (lower === '/start' || lower === '/admin') {
    const authed = isAdminId(userId);
    const body = authed
      ? `🐱 <b>Pocket Pals Admin</b>\n\n${fmtSnapshot(getSnapshot())}\n\nНажми «Админка» внизу или кнопку ниже.`
      : `🐱 <b>Pocket Pals</b>\n\nТвой Telegram ID: <code>${userId}</code>\n\nЧтобы открыть админку, отправь:\n<code>/login ${ADMIN_PASSWORD}</code>`;
    await sendTelegramMessage(token, chatId, body, { reply_markup: miniAppKeyboard() });
    return;
  }

  if (lower === '/login') {
    const pass = args.join(' ');
    if (pass !== ADMIN_PASSWORD) {
      await sendTelegramMessage(token, chatId, '❌ Неверный пароль');
      return;
    }
    grantAdminId(userId);
    await sendTelegramMessage(token, chatId, `✅ Доступ открыт\n\n${fmtSnapshot(getSnapshot())}\n\nОткрой Mini App:`, {
      reply_markup: miniAppKeyboard(),
    });
    return;
  }

  if (!isAdminId(userId)) {
    await sendTelegramMessage(token, chatId, `🔒 Сначала войди:\n<code>/login ${ADMIN_PASSWORD}</code>\n\nТвой ID: <code>${userId}</code>`);
    return;
  }

  if (lower === '/help') {
    await sendTelegramMessage(token, chatId, helpText());
    return;
  }

  if (lower === '/status') {
    await sendTelegramMessage(token, chatId, fmtSnapshot(getSnapshot()));
    return;
  }

  if (lower === '/web') {
    await sendTelegramMessage(token, chatId, `🌐 Веб-админка:\n${ADMIN_URL}`);
    return;
  }

  await sendTelegramMessage(token, chatId, 'Неизвестная команда. /help');
}

export async function processTelegramUpdate(token, update) {
  const msg = update?.message;
  if (!msg?.text?.startsWith('/') || !msg.chat?.id) return;
  await handleTelegramCommand(token, msg.chat.id, msg.from?.id || msg.chat.id, msg.text);
}
