#!/usr/bin/env bash
# CI smoke checks (no database required)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "==> npm ci"
npm ci

echo "==> Syntax check services"
node --check services/auth-service/src/index.js
node --check services/user-service/src/index.js
node --check services/order-service/src/index.js
node --check api-gateway/src/index.js

echo "==> Validate docker compose files"
docker compose -f docker-compose.yml config >/dev/null
docker compose -f deploy/docker-compose.prod.yml config >/dev/null

echo "==> All CI checks passed"
