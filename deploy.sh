#!/bin/bash
set -e

SITE_DIR="$HOME/domains/granit-sever.ru/public_html"
cd "$SITE_DIR"

echo "==> Git pull..."
git pull origin main

echo "==> Установка зависимостей..."
npm install --frozen-lockfile

echo "==> Сборка проекта..."
npm run build

echo "==> Копирование билда в public_html..."
cp -r dist/* "$SITE_DIR/"

echo "==> Готово! Сайт обновлён."
