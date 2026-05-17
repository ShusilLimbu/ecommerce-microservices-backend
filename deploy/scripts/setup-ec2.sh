#!/usr/bin/env bash
# One-time bootstrap for Ubuntu 22.04/24.04 EC2 (run as ubuntu user with sudo)
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/ecommerce-platform}"
REPO_URL="${REPO_URL:-}"

echo "==> Installing Docker"
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"

echo "==> Preparing app directory"
sudo mkdir -p "${APP_DIR}"
sudo chown -R "$USER:$USER" "${APP_DIR}"

if [ -n "${REPO_URL}" ] && [ ! -d "${APP_DIR}/.git" ]; then
  git clone "${REPO_URL}" "${APP_DIR}"
fi

if [ ! -f "${APP_DIR}/.env.production" ]; then
  cp "${APP_DIR}/deploy/.env.production.example" "${APP_DIR}/.env.production"
  echo "WARN: Edit ${APP_DIR}/.env.production before first deploy"
fi

chmod +x "${APP_DIR}/deploy/scripts/deploy.sh" 2>/dev/null || true

echo "==> EC2 setup complete. Log out/in for docker group, then configure .env.production"
