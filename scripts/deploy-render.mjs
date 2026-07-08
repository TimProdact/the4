#!/usr/bin/env node
/**
 * Deploy THE4 admin API to Render.com.
 * Requires RENDER_API_KEY in .env or env (Account Settings → API Keys).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const envPath = join(ROOT, '.env');
const API_URL_FILE = join(ROOT, '.the4-api-url');
const SERVICE_NAME = 'the4-admin-api';
const REPO = 'https://github.com/TimProdact/the4';

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

const API_KEY = process.env.RENDER_API_KEY;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'THE4ADMIN';
const ADMIN_IDS = process.env.TELEGRAM_ADMIN_IDS || '1696518783';

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`https://api.render.com/v1${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${API_KEY}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg = typeof data === 'object' ? JSON.stringify(data) : String(data);
    throw new Error(`Render API ${method} ${path} → ${res.status}: ${msg}`);
  }
  return data;
}

function serviceUrl(service) {
  const host = service?.service?.serviceDetails?.url || service?.serviceDetails?.url || service?.url;
  if (host) return host.startsWith('http') ? host : `https://${host}`;
  return `https://${SERVICE_NAME}.onrender.com`;
}

async function findService() {
  const list = await api(`/services?limit=100&name=${encodeURIComponent(SERVICE_NAME)}`);
  for (const item of list || []) {
    const svc = item.service || item;
    if (svc?.name === SERVICE_NAME) return svc;
  }
  return null;
}

async function deployViaApi() {
  if (!API_KEY) throw new Error('RENDER_API_KEY не задан');
  if (!TOKEN) throw new Error('TELEGRAM_BOT_TOKEN не задан в .env');

  const owners = await api('/owners?limit=20');
  const owner = owners?.[0]?.owner || owners?.[0];
  if (!owner?.id) throw new Error('Не найден Render owner');

  let service = await findService();
  if (!service) {
    console.log('→ Creating Render web service...');
    const created = await api('/services', {
      method: 'POST',
      body: {
        type: 'web_service',
        name: SERVICE_NAME,
        ownerId: owner.id,
        repo: REPO,
        branch: 'main',
        runtime: 'node',
        plan: 'free',
        region: 'frankfurt',
        serviceDetails: {
          env: 'node',
          plan: 'free',
          region: 'frankfurt',
          buildCommand: 'npm install --omit=dev',
          startCommand: 'node scripts/admin-api-server.mjs',
          healthCheckPath: '/',
          pullRequestPreviewsEnabled: false,
        },
        envVars: [
          { key: 'NODE_VERSION', value: '20' },
          { key: 'TELEGRAM_ADMIN_IDS', value: ADMIN_IDS },
          { key: 'TELEGRAM_BOT_TOKEN', value: TOKEN },
          { key: 'ADMIN_PASSWORD', value: ADMIN_PASSWORD },
        ],
      },
    });
    service = created.service || created;
  } else {
    console.log('→ Service exists, updating env vars...');
    const id = service.id;
    for (const { key, value } of [
      { key: 'TELEGRAM_BOT_TOKEN', value: TOKEN },
      { key: 'ADMIN_PASSWORD', value: ADMIN_PASSWORD },
      { key: 'TELEGRAM_ADMIN_IDS', value: ADMIN_IDS },
    ]) {
      await api(`/services/${id}/env-vars`, {
        method: 'PUT',
        body: { envVar: { key, value } },
      }).catch(async () => {
        await api(`/services/${id}/env-vars`, {
          method: 'POST',
          body: { envVar: { key, value } },
        });
      });
    }
    await api(`/services/${id}/deploys`, { method: 'POST', body: {} });
  }

  const url = serviceUrl({ service });
  writeFileSync(API_URL_FILE, url);
  console.log('→ API URL:', url);
  return url;
}

function deployViaCli() {
  if (!TOKEN) throw new Error('TELEGRAM_BOT_TOKEN не задан в .env');
  console.log('→ Creating service via Render CLI...');
  const out = execSync(
    [
      'render services create',
      `--name ${SERVICE_NAME}`,
      '--type web_service',
      `--repo ${REPO}`,
      '--branch main',
      '--runtime node',
      '--plan free',
      '--region frankfurt',
      '--build-command "npm install --omit=dev"',
      '--start-command "node scripts/admin-api-server.mjs"',
      '--health-check-path /',
      `--env-var NODE_VERSION=20`,
      `--env-var TELEGRAM_ADMIN_IDS=${ADMIN_IDS}`,
      `--env-var TELEGRAM_BOT_TOKEN=${TOKEN}`,
      `--env-var ADMIN_PASSWORD=${ADMIN_PASSWORD}`,
      '--confirm',
      '-o json',
    ].join(' '),
    { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
  );
  const data = JSON.parse(out);
  const url = serviceUrl(data);
  writeFileSync(API_URL_FILE, url);
  console.log('→ API URL:', url);
  return url;
}

async function waitForHealth(url, attempts = 40) {
  const health = `${url.replace(/\/$/, '')}/`;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(health, { signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        console.log('→ Health check OK');
        return true;
      }
    } catch {}
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, 15000));
  }
  console.log('\n⚠️  Service still waking up (Render free tier cold start ~1 min)');
  return false;
}

async function main() {
  let url;
  try {
    if (API_KEY) {
      url = await deployViaApi();
    } else {
      try {
        execSync('render whoami', { stdio: 'pipe' });
        url = deployViaCli();
      } catch {
        console.error(`
RENDER_API_KEY не найден и Render CLI не авторизован.

1. Создай API key: https://dashboard.render.com/u/settings#api-keys
2. Добавь в .env: RENDER_API_KEY=rnd_...
   или выполни: render login

Либо один раз в браузере:
https://dashboard.render.com/blueprint/new?repo=${encodeURIComponent(REPO)}
`);
        process.exit(1);
      }
    }
    await waitForHealth(url);
  } catch (e) {
    console.error('Deploy failed:', e.message);
    process.exit(1);
  }
}

main();
