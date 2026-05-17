#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/microservice}"
COMPOSE_FILE="${APP_DIR}/deploy/docker-compose.prod.yml"
ENV_FILE="${APP_DIR}/.env.production"
# BRANCH="${DEPLOY_BRANCH:-main}"
# REPO_URL="${REPO_URL:?ERROR: REPO_URL is not set — add it to envs: in the workflow}" 

# echo "==> Deploying branch: ${BRANCH}"



# if [ ! -d "${APP_DIR}/.git" ]; then
#   echo "==> No git repo found — cloning"
#   git clone --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
# else
#   echo "==> Repo exists — pulling branch: ${BRANCH}"
#   cd "${APP_DIR}"
#   git fetch origin "${BRANCH}"
#   git reset --hard "origin/${BRANCH}"
# fi

# cd "${APP_DIR}"
# git fetch origin "${BRANCH}"
# git reset --hard "origin/${BRANCH}"
if [ ! -f "${ENV_FILE}" ]; then
  echo "ERROR: Missing ${ENV_FILE}"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

echo "==> Docker compose up"
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --build --remove-orphans

GATEWAY_PORT="${GATEWAY_PORT:-8080}"
echo "==> Health check on port ${GATEWAY_PORT}"
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:${GATEWAY_PORT}/health" >/dev/null; then
    echo "==> Deployment healthy"
    docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" ps
    exit 0
  fi
  sleep 5
done

echo "ERROR: Gateway health check failed"
docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" logs --tail=100 api-gateway
exit 1
