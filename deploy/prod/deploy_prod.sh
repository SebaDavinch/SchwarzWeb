#!/usr/bin/env bash
# =============================================================
#  SchwarzWeb — Update Script
#  Usage: bash deploy_prod.sh [--no-bot]
#
#  Накатывает обновление на уже запущенный сервер.
#  .env, systemd-юниты и nginx НЕ трогаются.
# =============================================================

set -euo pipefail

APP_DIR="/var/www/schwarzweb"
RELEASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

NO_BOT=false
if [[ "${1:-}" == "--no-bot" ]]; then
  NO_BOT=true
fi

echo ""
echo "========================================"
echo "  SchwarzWeb — Update"
echo "  source : $RELEASE_DIR"
echo "  target : $APP_DIR"
echo "========================================"
echo ""

# ── 1. Остановить сервисы ────────────────────────────────────
echo "[1/4] Stopping services ..."
sudo systemctl stop schwarz-bot 2>/dev/null || true
sudo systemctl stop schwarz-api

# ── 2. Скопировать файлы ────────────────────────────────────
echo "[2/4] Copying files ..."

rsync -a --delete \
  --exclude=".env" \
  --exclude="node_modules" \
  --exclude="data.json" \
  "$RELEASE_DIR/dist/"   "$APP_DIR/dist/"

rsync -a "$RELEASE_DIR/server/"           "$APP_DIR/server/"
rsync -a "$RELEASE_DIR/package.json"      "$APP_DIR/package.json"
rsync -a "$RELEASE_DIR/package-lock.json" "$APP_DIR/package-lock.json"

if $NO_BOT; then
  echo "       [--no-bot] Skipping bot."
else
  if [ -d "$RELEASE_DIR/bot" ]; then
    rsync -a "$RELEASE_DIR/bot/" "$APP_DIR/bot/"
  fi
fi

# ── 3. Зависимости ──────────────────────────────────────────
echo "[3/4] npm ci --omit=dev ..."
cd "$APP_DIR"
npm ci --omit=dev

# ── 4. Запустить сервисы ────────────────────────────────────
echo "[4/4] Starting services ..."
sudo systemctl start schwarz-api

if ! $NO_BOT; then
  sudo systemctl start schwarz-bot 2>/dev/null || true
fi

echo ""
echo "========================================"
echo "  Done."
echo "  API logs : journalctl -u schwarz-api -f"
echo "  Bot logs : journalctl -u schwarz-bot -f"
echo "========================================"
echo ""
