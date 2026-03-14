#!/usr/bin/env bash
# =============================================================
#  SchwarzWeb — Update Script
#  Usage: bash deploy_prod.sh
#
#  Накатывает обновление на уже запущенный сервер.
#  Управляет одним сервисом: schwarz.service
#  .env, systemd-юниты и nginx НЕ трогаются.
# =============================================================

set -euo pipefail

APP_DIR="/var/www/schwarzweb"
RELEASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo ""
echo "========================================"
echo "  SchwarzWeb — Update"
echo "  source : $RELEASE_DIR"
echo "  target : $APP_DIR"
echo "========================================"
echo ""

# ── 1. Остановить сервис ────────────────────────────────────
echo "[1/4] Stopping schwarz.service ..."
sudo systemctl stop schwarz

# ── 2. Скопировать файлы ────────────────────────────────────
echo "[2/4] Copying files ..."

rm -rf "$APP_DIR/dist"
cp -r "$RELEASE_DIR/dist" "$APP_DIR/dist"

rm -rf "$APP_DIR/server"
cp -r "$RELEASE_DIR/server" "$APP_DIR/server"

cp "$RELEASE_DIR/package.json"      "$APP_DIR/package.json"
cp "$RELEASE_DIR/package-lock.json" "$APP_DIR/package-lock.json"

if [ -d "$RELEASE_DIR/bot" ]; then
  rm -rf "$APP_DIR/bot"
  cp -r "$RELEASE_DIR/bot" "$APP_DIR/bot"
fi

# ── 3. Зависимости ──────────────────────────────────────────
echo "[3/4] npm ci --omit=dev ..."
cd "$APP_DIR"
npm ci --omit=dev

# ── 4. Запустить сервис ─────────────────────────────────────
echo "[4/4] Starting schwarz.service ..."
sudo systemctl start schwarz

echo ""
echo "========================================"
echo "  Done."
echo "  Logs : journalctl -u schwarz -f"
echo "========================================"
echo ""
