#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export NEXT_PUBLIC_BASE_PATH=/the4
export GITHUB_PAGES=true

echo "→ Building static site..."
npm run build

echo "→ Ensuring .nojekyll (Jekyll must not ignore _next/)..."
touch out/.nojekyll

echo "→ Deploying to gh-pages branch via git..."
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

echo "→ Live: https://timprodact.github.io/the4/"
