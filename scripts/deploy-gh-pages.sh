#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export NEXT_PUBLIC_BASE_PATH=/the4
export GITHUB_PAGES=true

echo "→ Deploying API (Render)..."
node scripts/deploy-render.mjs || {
  echo "⚠️  Render deploy skipped — using existing .the4-api-url if present"
}

if [ -f .the4-api-url ]; then
  export VITE_THE4_API_URL="$(cat .the4-api-url)"
fi

echo "→ Building mini-app..."
(
  cd admin/mini-app
  npm install
  npm run build
)

if [ ! -f public/admin/mini-app-dist/index.html ]; then
  echo "❌ mini-app build failed: public/admin/mini-app-dist/index.html missing"
  exit 1
fi

echo "→ Building static site..."
npm run build

if [ ! -f out/admin/mini-app-dist/index.html ]; then
  echo "→ Copying mini-app into out/ (fallback)..."
  mkdir -p out/admin
  rm -rf out/admin/mini-app-dist
  cp -R public/admin/mini-app-dist out/admin/mini-app-dist
fi

if [ ! -f out/admin/mini-app-dist/index.html ]; then
  echo "❌ mini-app not in out/: out/admin/mini-app-dist/index.html missing"
  exit 1
fi

echo "→ Ensuring .nojekyll..."
touch out/.nojekyll

echo "→ Deploying to gh-pages..."
(
  cd out
  rm -rf .git
  git init -q
  git remote add origin "https://github.com/TimProdact/the4.git"
  git checkout -q -b gh-pages
  git add -A
  git commit -q -m "deploy $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  git push -f origin gh-pages
)

echo "→ Configuring Telegram bot menu..."
node scripts/setup-telegram-mini-app.mjs || echo "⚠️  Bot menu setup skipped (no token?)"

echo "→ Live vitrina: https://timprodact.github.io/the4/"
echo "→ Live mini-app: https://timprodact.github.io/the4/admin/mini-app-dist/"
