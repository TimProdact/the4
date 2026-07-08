#!/usr/bin/env node
/**
 * Deploy THE4 admin API to Cloudflare Workers.
 * Requires: wrangler login (once), CLOUDFLARE_ACCOUNT_ID optional
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WORKER = join(ROOT, 'workers/the4-admin');
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
const adminPass = process.env.ADMIN_PASSWORD || 'THE4ADMIN';
const adminIds = process.env.TELEGRAM_ADMIN_IDS || '';

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN не задан в .env');
  process.exit(1);
}

console.log('→ Creating KV namespace (if needed)...');
let kvId = '';
try {
  const out = execSync('npx --yes wrangler kv namespace list', { cwd: WORKER, encoding: 'utf8' });
  const match = out.match(/"title":"THE4_STORE"[\s\S]*?"id":"([^"]+)"/);
  if (match) kvId = match[1];
} catch {}

if (!kvId) {
  try {
    const created = execSync('npx --yes wrangler kv namespace create THE4_STORE', { cwd: WORKER, encoding: 'utf8' });
    const m = created.match(/id = "([^"]+)"/);
    if (m) kvId = m[1];
  } catch (e) {
    console.warn('KV create:', e.message);
  }
}

if (kvId) {
  const tomlPath = join(WORKER, 'wrangler.toml');
  let toml = readFileSync(tomlPath, 'utf8');
  toml = toml.replace(/id = "placeholder"/, `id = "${kvId}"`);
  writeFileSync(tomlPath, toml);
  console.log('→ KV namespace:', kvId);
}

console.log('→ Deploying worker...');
const deploy = execSync(
  `npx --yes wrangler deploy --var TELEGRAM_BOT_TOKEN:${token} --var ADMIN_PASSWORD:${adminPass} --var TELEGRAM_ADMIN_IDS:${adminIds}`,
  { cwd: WORKER, encoding: 'utf8' },
);
console.log(deploy);

const urlMatch = deploy.match(/https:\/\/[^\s]+\.workers\.dev/);
if (urlMatch) {
  const apiUrl = urlMatch[0];
  writeFileSync(join(ROOT, '.the4-api-url'), apiUrl);
  console.log('→ API URL:', apiUrl);
}
