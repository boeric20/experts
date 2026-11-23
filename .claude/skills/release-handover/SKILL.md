---
name: release-handover
description: Hand a finished Landman Command version to the owner - bump VERSION, update docs/PROGRESS.md, commit, push, and give Mac update steps. Use when work is verified and ready to deliver.
---
# Release hand-over

Only after QA passed and the Product Owner wants the version delivered.

1. Bump `VERSION` (format `YYYYMMDDNN`, higher than the current value). `update-app.sh` picks the download with the highest number and refuses older ones.
2. Add a dated section to `docs/PROGRESS.md`: what was built, how it was verified (real results), known limits.
3. Update `README.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` where the change affects them.
4. Commit on the development branch with a message that explains the change; push with retries.
5. `main` is updated only when the Product Owner asks: fast-forward only (`git push origin HEAD:main`), never force.
6. Give the owner update steps (see `mac-owner-instructions`):
   - Back up first when the release includes a migration: `sh backup.sh`.
   - Download the zip of the branch they install from, run `sh update-app.sh`, then `docker compose up --build`.
   - What to check afterwards.

`update-app.sh` replaces `backend/app`, `backend/tests`, `frontend/src`, `frontend/public`, `db`, and `docs` whole, and copies everything else over. It keeps `data/`, `.env`, and the database.
