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
