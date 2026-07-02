import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, '../public/embed/konstruktor');
const htmlPath = path.join(__dirname, '../../Конструктор памятников/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const re = /(?:src|data-src)=["']([^"']+)["']/g;
const paths = new Set();
let m;
while ((m = re.exec(html))) {
  if (m[1].startsWith('images/construkt-pam')) paths.add(m[1]);
}

const svgs = [
  'tablichki.svg', 'nadpis-izobrazhenie.svg', 'hram.svg', 'ikona.svg', 'angel.svg',
  'simvolika.svg', 'ramka.svg', 'vinetka.svg', 'peyzazh.svg', 'voin.svg', 'vnimanie.svg',
];
for (const s of svgs) {
  const p = `construkt-pam/img/constructor/${s}`;
  if (!fs.existsSync(path.join(base, p))) paths.add(p);
}

const sites = ['https://pamyatniki.host-demo.ru', 'https://granit-sever.ru'];
const list = [...paths].filter((p) => !fs.existsSync(path.join(base, p)));

function download(url, out) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(res.headers.location, out).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(out);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchOne(p) {
  for (const site of sites) {
    const url = `${site}/${p}`;
    try {
      await download(url, path.join(base, p));
      return true;
    } catch {
      /* try next site */
    }
  }
  return false;
}

const concurrency = 12;
let index = 0;
let ok = 0;
let fail = 0;

async function worker() {
  while (index < list.length) {
    const i = index++;
    const p = list[i];
    if (await fetchOne(p)) ok++;
    else {
      fail++;
      console.log('FAIL', p);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));
console.log(`Done ok=${ok} fail=${fail} total=${list.length}`);
