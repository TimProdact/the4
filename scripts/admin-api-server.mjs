#!/usr/bin/env node
/**
 * THE4 Admin API — file-based HTTP server (bot-store.mjs).
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateInitData } from '../bot/telegram-auth.mjs';
import {
  getSnapshot,
  getPublicDrop,
  getPublicStorefront,
  runAction,
  runPublicAction,
  isAdminId,
  grantAdminId,
} from './bot-store.mjs';
import { processTelegramUpdate } from './telegram-bot-handlers.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = Number(process.env.PORT || process.env.ADMIN_API_PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';

function loadEnv() {
  const envPath = join(ROOT, '.env');
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

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'THE4ADMIN';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
}

function send(res, status, body) {
  cors(res);
  res.writeHead(status);
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}

function authUser(body) {
  if (!TOKEN) throw Object.assign(new Error('Bot not configured'), { status: 500 });
  const parsed = validateInitData(body.initData, TOKEN);
  if (!parsed) throw Object.assign(new Error('Invalid Telegram session'), { status: 401 });
  if (!isAdminId(parsed.user.id)) {
    throw Object.assign(
      new Error(`Нет доступа. Открой @pocketpals_bot и отправь /login ${ADMIN_PASSWORD}`),
      { status: 403 },
    );
  }
  return parsed.user;
}

const server = createServer(async (req, res) => {
  const path = (req.url || '').split('?')[0];

  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'GET' && (path === '/' || path === '/health')) {
    return send(res, 200, { ok: true, service: 'the4-admin-api' });
  }

  if (req.method === 'GET' && path === '/drop') {
    try {
      const url = new URL(req.url || '', 'http://local');
      const vip = url.searchParams.get('vip') === '1';
      const dropId = url.searchParams.get('dropId') || undefined;
      return send(res, 200, getPublicDrop(vip, dropId));
    } catch (e) {
      return send(res, 500, { error: e.message || 'Server error' });
    }
  }

  if (req.method === 'GET' && path === '/storefront') {
    try {
      return send(res, 200, getPublicStorefront());
    } catch (e) {
      return send(res, 500, { error: e.message || 'Server error' });
    }
  }

  if (req.method === 'POST' && path === '/telegram/webhook') {
    if (!TOKEN) return send(res, 500, { error: 'Bot not configured' });
    let update = {};
    try {
      update = await readBody(req);
      await processTelegramUpdate(TOKEN, update);
    } catch (e) {
      console.error('telegram webhook', e);
    }
    return send(res, 200, { ok: true });
  }

  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });

  let body = {};
  try {
    body = await readBody(req);
  } catch {
    return send(res, 400, { error: 'Invalid JSON' });
  }

  try {
    if (body.action === 'grant_admin') {
      if (body.secret !== ADMIN_PASSWORD) return send(res, 403, { error: 'Forbidden' });
      grantAdminId(body.telegramId);
      return send(res, 200, { ok: true });
    }

    if (body.action === 'public') {
      const result = runPublicAction(body.publicAction, body.payload || {});
      return send(res, 200, result);
    }

    const user = authUser(body);

    if (body.action === 'bootstrap') {
      return send(res, 200, {
        snapshot: getSnapshot(),
        firstName: user.first_name,
        telegramId: user.id,
      });
    }

    if (body.action === 'admin_action') {
      const snapshot = runAction(body.adminAction, body.payload || {});
      return send(res, 200, { snapshot });
    }

    return send(res, 400, { error: 'Unknown action' });
  } catch (e) {
    return send(res, e.status || 500, { error: e.message || 'Server error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`→ THE4 Admin API http://${HOST}:${PORT}`);
});
