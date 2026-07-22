#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

chmod +x "$SCRIPT_DIR/renew-ssl.sh"
cp "$SCRIPT_DIR/certbot-renew.cron" /etc/cron.d/granite-certbot-renew
chmod 644 /etc/cron.d/granite-certbot-renew

# Штатный certbot.timer дублирует задачу — отключаем, чтобы не гонять renew дважды.
if systemctl is-enabled certbot.timer &>/dev/null; then
  systemctl disable --now certbot.timer
fi

echo "Cron установлен: /etc/cron.d/granite-certbot-renew"
echo "Скрипт: /opt/granite/vps/nginx/renew-ssl.sh"
echo "Лог: /var/log/granite-certbot-renew.log"
