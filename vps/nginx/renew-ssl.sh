#!/bin/bash
# Обновление Let's Encrypt сертификатов.
# Certbot обновляет только сертификаты, срок которых истекает в ближайшие 30 дней.
set -euo pipefail

certbot renew \
  --quiet \
  --no-random-sleep-on-renew \
  --deploy-hook "nginx -t && systemctl reload nginx"
