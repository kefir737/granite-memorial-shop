#!/bin/bash
set -e

echo "==> Устанавливаю Nginx и Certbot..."
apt-get update -q
apt-get install -y nginx certbot python3-certbot-nginx

echo "==> Копирую конфиги сайтов..."
cp /opt/granite/vps/nginx/granit-sever.ru.conf /etc/nginx/sites-available/granit-sever.ru
cp /opt/granite/vps/nginx/kladbishe-kiyevo.ru.conf /etc/nginx/sites-available/kladbishe-kiyevo.ru

ln -sf /etc/nginx/sites-available/granit-sever.ru /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/kladbishe-kiyevo.ru /etc/nginx/sites-enabled/

rm -f /etc/nginx/sites-enabled/default

echo "==> Временный конфиг без SSL для получения сертификата..."
sed -i 's/return 301.*/return 200 ok;/g' /etc/nginx/sites-available/granit-sever.ru
sed -i '/listen 443/,/^}/d' /etc/nginx/sites-available/granit-sever.ru

nginx -t && systemctl reload nginx

echo "==> Получаю SSL для granit-sever.ru..."
certbot --nginx -d granit-sever.ru -d www.granit-sever.ru --non-interactive --agree-tos -m admin@granit-sever.ru

echo "==> Восстанавливаю конфиг granit-sever.ru..."
cp /opt/granite/vps/nginx/granit-sever.ru.conf /etc/nginx/sites-available/granit-sever.ru

nginx -t && systemctl reload nginx

echo "==> Готово! Осталось:"
echo "  1. Направить DNS kladbishe-kiyevo.ru на этот VPS"
echo "  2. Запустить новый проект на порту 8082"
echo "  3. Запустить: certbot --nginx -d kladbishe-kiyevo.ru -d www.kladbishe-kiyevo.ru"
