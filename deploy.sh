#!/bin/bash
set -e

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

REPO_DIR="$HOME/domains/granit-sever.ru/repo"
SITE_DIR="$HOME/domains/granit-sever.ru"

mkdir -p "$REPO_DIR"

echo "==> Git pull..."
if [ ! -d "$REPO_DIR/.git" ]; then
  git clone https://github.com/kefir737/granite-memorial-shop "$REPO_DIR"
else
  cd "$REPO_DIR"
  git pull origin main
fi

cd "$REPO_DIR"

echo "==> Установка зависимостей..."
npm install --frozen-lockfile

echo "==> Сборка проекта..."
npm run build

echo "==> Копирование билда в корень сайта..."
cp -r "$REPO_DIR/dist/"* "$SITE_DIR/"

echo "==> Готово! Сайт обновлён."
