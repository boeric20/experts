---
name: dependency-audit
description: Check Landman Command's npm and Python dependencies for security advisories, outdated versions, and licences, using current web sources. Use before adding or upgrading any library and periodically.
---
# Dependency audit

Inventory
- Frontend: `frontend/package.json` (+ `package-lock.json`). Backend: `backend/requirements.txt`, `backend/requirements-dev.txt`. Docker base images in the Dockerfiles and `docker-compose.yml`.

Checks
1. `cd frontend && npm audit --omit=dev` (needs registry access). Note that npm audit can be noisy; judge each finding by whether the vulnerable code path is used.
2. Python: `pip-audit -r backend/requirements.txt` if available (`pip install pip-audit`), otherwise look up each package's advisories.
3. For each major library (Next.js, React, MapLibre, FastAPI, psycopg, Shapely, pyproj, GeoPandas, PostGIS image): check the vendor's security advisories page and the latest release in the same major line. Record URL and date.
4. Licence of anything new: record it in `THIRD_PARTY_NOTICES.md`.

Upgrade policy
- Prefer patch upgrades within the current line for security fixes. Major upgrades are separate proposals.
- After any upgrade: run all checks (`run-backend-tests`, `run-frontend-checks`, `browser-check`) and build the Docker images.

Report: table of package, current version, latest safe version in line, advisories (id, severity, applies or not, why), licence, recommendation.
