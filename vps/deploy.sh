#!/bin/bash
set -e

REPO="https://github.com/kefir737/granite-memorial-shop"
DIR="/opt/granite"

if [ ! -d "$DIR" ]; then
  git clone "$REPO" "$DIR"
else
  cd "$DIR" && git pull origin main
fi

cd "$DIR/vps"

if [ ! -f ".env" ]; then
  echo "ОШИБКА: создай файл .env из .env.example"
  echo "cp .env.example .env && nano .env"
  exit 1
fi

docker compose pull 2>/dev/null || true
docker compose up --build -d

echo "Готово! Сайт запущен."
echo "Проверь: curl http://localhost/api/monuments"
