#!/bin/bash
set -e
rm -rf /opt/granite/public/embed/konstruktor
mkdir -p /opt/granite/public/embed/konstruktor
python3 - <<'PY'
import zipfile
zipfile.ZipFile('/tmp/konstruktor.zip').extractall('/opt/granite/public/embed/konstruktor')
PY
echo "images:" $(find /opt/granite/public/embed/konstruktor/images -type f | wc -l)
cd /opt/granite/vps
docker compose build frontend
docker compose up -d frontend
