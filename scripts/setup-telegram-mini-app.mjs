#!/usr/bin/env node
/**
 * Configure Telegram bot menu button → THE4 Mini App.
 * Usage: node scripts/setup-telegram-mini-app.mjs [miniAppUrl]
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const envPath = join(ROOT, '.env');

function loadEnv() {
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const token = process.env.TELEGRAM_BOT_TOKEN;
const miniAppUrl =
  process.argv[2] ||
  process.env.THE4_MINI_APP_URL ||
  'https://timprodact.github.io/the4/admin/mini-app-dist/';
const apiUrl =
  process.env.THE4_API_URL ||
  (existsSync(join(ROOT, '.the4-api-url')) ? readFileSync(join(ROOT, '.the4-api-url'), 'utf8').trim() : '') ||
  'https://the4-admin-api.onrender.com';
const webhookUrl = `${apiUrl.replace(/\/$/, '')}/telegram/webhook`;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN не задан в .env');
  process.exit(1);
}

const API = `https://api.telegram.org/bot${token}`;

async function tg(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'Telegram API error');
  return data.result;
}

const me = await tg('getMe', {});
console.log(`→ Bot @${me.username}`);

await tg('setChatMenuButton', {
  menu_button: {
    type: 'web_app',
    text: 'Админка',
    web_app: { url: miniAppUrl },
  },
});
console.log('→ Menu button: Админка →', miniAppUrl);

await tg('setMyCommands', {
  commands: [
    { command: 'start', description: 'Открыть админку' },
    { command: 'admin', description: 'Mini App админка' },
    { command: 'status', description: 'Статус дропа' },
    { command: 'help', description: 'Справка' },
  ],
});
console.log('→ Commands updated');

try {
  await tg('setWebhook', { url: webhookUrl, allowed_updates: ['message'] });
  console.log('→ Webhook:', webhookUrl);
} catch (err) {
  console.warn('setWebhook:', err.message);
}

console.log(`
✅ Готово. Открой @${me.username} → кнопка «Админка» внизу.

⚠️  В BotFather проверь URL (без опечаток!):
   Main App + Menu Button → ${miniAppUrl}
   /setdomain → timprodact.github.io
   (НЕ timproduct — с буквой «d» в prodact)
`);
