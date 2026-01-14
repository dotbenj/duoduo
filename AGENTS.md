# Repository Guidelines

## Project Structure & Module Organization
- `docker-compose.yml`: single entry point; runs `jc21/nginx-proxy-manager:latest` with mapped ports 80/81/443.
- `data/`: persistent state for the container — SQLite DB (`database.sqlite`), nginx configs under `data/nginx/`, and logs under `data/logs/`.
- `letsencrypt/`: ACME certificates mounted into the container.

## Build, Test, and Development Commands
- Start or update stack: `docker compose up -d` (pulls image if missing, reuses volumes).
- Refresh image only: `docker compose pull` then `docker compose up -d`.
- Stop stack: `docker compose down` (keeps volumes).
- Inspect runtime: `docker compose ps` and `docker compose logs -f app`.
- Enter container shell when debugging: `docker compose exec app /bin/bash`.

## Coding Style & Naming Conventions
- YAML uses 2-space indentation; keep keys lowercase and hyphen-separated for new entries.
- Name additional services descriptively (e.g., `redis-cache`) and expose ports explicitly.
- For nginx snippets in `data/nginx/`, prefer clear file names matching host IDs; keep directives one per line.

## Testing Guidelines
- Validate compose syntax before changes: `docker compose config`.
- After updates, verify container health: `docker compose up -d` then `docker compose ps` and check `docker compose logs`.
- For nginx config checks: `docker compose exec app nginx -t` to catch syntax errors.
- Confirm certificates present under `letsencrypt/` when enabling HTTPS.

## Commit & Pull Request Guidelines
- If using git, favor concise Conventional Commit–style messages (e.g., `fix: update proxy host config`) and scope one logical change per commit.
- PRs should describe the change, mention affected hosts/config files, and include any validation commands run (logs snippets optional).
- Avoid committing sensitive material: never include `data/database.sqlite`, `data/keys.json`, or generated certificates in patches.

## Security & Configuration Tips
- Treat `data/keys.json` and TLS assets as secrets; restrict permissions and avoid sharing archives of `data/` or `letsencrypt/`.
- When testing new proxies, start with temporary host entries and remove unused configs to keep `data/nginx/` tidy.
