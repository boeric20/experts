---
name: cloud-dev-environment
description: Start Landman Command in a Claude Code cloud session (or any Linux container) - Docker daemon, PostGIS, backend on the host, frontend build and start - and the known network limits. Use before running database tests, browser checks, or the app.
---
# Running the app in a cloud session

```bash
# 1. Docker daemon (not running at session start; restart it after a container restart)
pgrep dockerd >/dev/null || (dockerd > /tmp/dockerd.log 2>&1 &) ; sleep 5
# 2. Database
docker compose up -d db
# 3. Backend on the host (migrations run at start)
cd backend && pip install -q -r requirements-dev.txt && \
  DATABASE_URL=postgresql://landman:landman@localhost:5432/landman CORS_ORIGINS=http://localhost:3000 \
  nohup python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
curl -s localhost:8000/health
# 4. Frontend
cd frontend && npm ci && npm run build && (nohup npx next start -p 3000 > /tmp/frontend.log 2>&1 &)
```
Stop the frontend with `pkill -f next-server`; the backend with `pkill -f "uvicorn app.main"`.

Known limits
- Blocked hosts: the online basemap (tiles.openfreemap.org), ghcr.io, some government sites. The map falls back to a plain background; that is expected.
- Docker Hub may rate-limit; `mirror.gcr.io/library/<image>` works for official images.
- Docker image builds need the session CA bundle: copy `/root/.ccr/ca-bundle.crt` into a scratch build context and pass `--network host` with the proxy build args.
- County parcel files are not in git. The development database is empty unless parcels were imported; tests use synthetic tracts.
- Never point tests or scripts that delete data at a database you did not create for the purpose.
