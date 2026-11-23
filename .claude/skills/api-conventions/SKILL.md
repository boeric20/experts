---
name: api-conventions
description: Backend conventions for Landman Command - FastAPI router and service layout, psycopg raw SQL, transactions, conflicts, errors, and data-separation rules. Use when writing or reviewing backend code.
---
# Backend conventions

Layout
- `app/routers/*.py`: thin HTTP layer. Parse input with Pydantic, open a connection with `get_conn()`, call a service, commit, map errors.
- `app/services/*.py`: logic. Functions take a psycopg cursor (dict rows) and return plain dicts or lists.
- Register new routers in `app/main.py`. Declare fixed paths (`/projects/visibility`) before parameter paths (`/projects/{id}`).

SQL
- psycopg 3, parameterised queries only (`%s` or `%(name)s`). Never format user input into SQL text.
- One transaction per write request; roll back on error.
- UUID primary keys for anything a user can reference.
- Store UTC (`timestamptz`); return ISO strings; the frontend shows local time.
- Soft delete (`archived_at`, `removed_at`, `deleted_at`); hard delete only where approved.

Errors
- Raise `ProjectError(message, status)` (from `services/projects.py`) for user-facing errors; routers turn it into `HTTPException`.
- Edits use a revision number. A stale edit returns 409 with `{"detail": ..., "current": <saved record>}` so the client can show both versions.
- Messages are plain sentences a landman understands, and say whether anything was changed.

Data separation
- Import code (`services/projects.py`, `services/kml_features.py`, `ingest/`) never reads or writes user tables (`activity`, contacts, notes). A test enforces this.
- Every external record keeps source, vintage, and verification status.

Security
- No secrets in code; read from environment via `app/config.py`.
- Limit upload sizes and counts (see `MAX_FEATURES`, `MAX_KML_BYTES` in `kml_features.py`).
