#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "→ Installing dependencies..."
npm install

echo "→ Building..."
npm run build

SITE_ID="${NETLIFY_SITE_ID:-}"
if [ -z "$SITE_ID" ] && [ -f .netlify/state.json ]; then
  SITE_ID="$(node -e "const s=require('./.netlify/state.json'); console.log(s.siteId||'')")"
fi

DEPLOY_ARGS=(--build)
if [ -n "$SITE_ID" ]; then
  DEPLOY_ARGS+=(--site "$SITE_ID")
fi

echo "→ Uploading draft..."
DEPLOY_JSON="$(CI=true npx --yes netlify-cli deploy "${DEPLOY_ARGS[@]}" --json)"
DEPLOY_ID="$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.deploy_id||d.id||'')" "$DEPLOY_JSON")"

if [ -n "$DEPLOY_ID" ] && [ -n "$SITE_ID" ]; then
  echo "→ Promoting deploy $DEPLOY_ID to production..."
  npx --yes netlify-cli api restoreSiteDeploy --data "{\"site_id\":\"$SITE_ID\",\"deploy_id\":\"$DEPLOY_ID\"}"
fi

echo "→ Done"
