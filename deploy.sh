#!/bin/bash
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

REPO_DIR="$HOME/domains/granit-sever.ru"
SITE_DIR="$REPO_DIR/public_html"

cd "$REPO_DIR"

echo "==> Git pull..."
git pull origin main

echo "==> Установка зависимостей..."
npm install --frozen-lockfile

echo "==> Сборка проекта..."
npm run build

echo "==> Копирование билда в public_html..."
cp -r "$REPO_DIR/dist/"* "$SITE_DIR/"

echo "==> Готово! Сайт обновлён."