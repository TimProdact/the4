#!/usr/bin/env node
/**
 * Start local API + public tunnel, rebuild mini-app, redeploy gh-pages.
 */
import { spawn, execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import localtunnel from 'localtunnel';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PORT = Number(process.env.ADMIN_API_PORT || 8787);

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('→ Starting local admin API...');
  const api = spawn('node', ['scripts/admin-api-server.mjs'], {
    cwd: ROOT,
    stdio: 'inherit',
    detached: false,
  });

  await sleep(1200);

  console.log('→ Opening public tunnel...');
  const tunnel = await localtunnel({ port: PORT });
  const apiUrl = tunnel.url;
  console.log('→ Public API:', apiUrl);

  writeFileSync(join(ROOT, '.the4-api-url'), apiUrl);

  console.log('→ Rebuilding mini-app with API URL...');
  execSync('npm install && npm run build', {
    cwd: join(ROOT, 'admin/mini-app'),
    env: { ...process.env, VITE_THE4_API_URL: apiUrl },
    stdio: 'inherit',
  });

  execSync('cp -R admin/mini-app-dist out/admin/mini-app-dist', {
    cwd: ROOT,
    stdio: 'inherit',
  });

  console.log('→ Pushing mini-app to gh-pages...');
  execSync(`(
    cd out &&
    rm -rf .git &&
    git init -q &&
    git remote add origin https://github.com/TimProdact/the4.git &&
    git checkout -q -b gh-pages &&
    git add admin/mini-app-dist &&
    git commit -q -m "mini-app api tunnel" || true &&
    git push -f origin gh-pages
  )`, { cwd: ROOT, shell: '/bin/bash', stdio: 'inherit' });

  execSync('node scripts/setup-telegram-mini-app.mjs', { cwd: ROOT, stdio: 'inherit' });

  console.log(`
✅ Mini App обновлён с API: ${apiUrl}
⚠️  Туннель живёт пока работает этот процесс. Для постоянного API добавь CLOUDFLARE_API_TOKEN в .env
`);

  process.on('SIGINT', () => {
    tunnel.close();
    api.kill();
    process.exit(0);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
