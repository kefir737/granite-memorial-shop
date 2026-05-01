# Working Context: granite-memorial-shop

## Repositories and paths

- Local workspace root: `C:\Users\user\Documents\00code`
- Main local repo: `C:\Users\user\Documents\00code\granite-memorial-shop`
- Server host: `7e5f18fb7dcc.vps.myjino.ru`
- Server user: `root`
- Server repo path: `/opt/granite/vps`
- SSH key path (local): `C:\Users\user\.ssh\id_ed25519`

## Branch and workflow policy

- Working branch: `main`
- Edit locally first, then validate locally.
- Commit and push to `origin/main`.
- Update server only through `git pull`.
- Run `docker compose up -d` only after local validation passed.
- Always perform post-deploy checks.

## Standard execution order

1. Edit in local repo.
2. Run local checks relevant to the change.
3. Commit on `main` and push.
4. SSH to `/opt/granite/vps` and run `git pull`.
5. Run `docker compose up -d`.
6. Run post-deploy checks.

## Post-deploy checks (mandatory)

- `docker ps` (containers are up)
- health states for containers with healthchecks
- HTTP checks:
  - `http://127.0.0.1:8081/`
  - `https://granit-sever.ru/`
- if failed, inspect:
  - `docker logs <container>`
  - `docker inspect <container>` health details

## Runtime/deployment specifics (granite)

- Active server repo path: `/opt/granite/vps`.
- Domain routing:
  - `granit-sever.ru` -> nginx -> `127.0.0.1:8081` (`granite-frontend-1`)
- Compose project name is pinned as `name: granite`.
- After backend (`vps/api`) code changes, prefer explicit rebuild:
  - `docker compose up -d --build api`
  - then run post-deploy checks.

## App responsibility map (must preserve)

- Site = frontend user-facing pages (`src/components/site`, `src/pages`).
- Admin = admin UI/panel (`src/components/admin`).
- Backend = FastAPI service in `vps/api/main.py`.
- DB = PostgreSQL (`granite-db-1`) with settings/content tables.

## Key backend/settings guardrails

- Settings API must not expose secrets in `GET /api/settings`:
  - never return `adminPasswordHash`
  - return sanitized `smtpPassword` (empty in response)
- Settings persistence:
  - keep updates in `site_settings` table (not `settings`)
  - do not overwrite smtp password when frontend sends empty placeholder.
- Frontend safety:
  - treat empty settings strings as missing and fallback to defaults for critical fields (`heroTitle`, etc.).

## Current test data baseline (admin settings)

- phone: `+7 (499) 288-22-18`
- phone2Label: `WhatsApp / Telegram / MAX`
- phone2: `+7 (963) 751-68-23`
- address: `Московская область, Лобня, улица Киово, 137`
