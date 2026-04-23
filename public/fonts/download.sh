#!/bin/bash
# Запустить: bash download.sh
# Скачает все woff2 шрифты и создаст fonts.css

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
CSS_URL="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Golos+Text:wght@300;400;500;600&display=swap"

CSS=$(curl -s -A "$UA" "$CSS_URL")

echo "$CSS" | grep -oP 'https://fonts\.gstatic\.com\S+\.woff2' | sort -u | while IFS= read -r url; do
  fname=$(basename "$url")
  curl -s -o "$fname" "$url" && echo "OK $fname"
done

echo "$CSS" | perl -pe 's|url\((https://fonts\.gstatic\.com/\S+/([^/]+\.woff2))\)|url("/fonts/$2")|g' > fonts.css
echo "Готово. Файлов: $(ls *.woff2 2>/dev/null | wc -l)"
