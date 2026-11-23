---
name: run-backend-tests
description: Run the Landman Command backend test suite (pytest) against a throwaway PostGIS database and report real results. Use after any backend, migration, or ingestion change.
---
# Backend tests

```bash
cd backend && python3 -m pytest -q
```
- Needs PostGIS running (see `cloud-dev-environment`). The suite creates and drops a database named `landman_test`; `backend/tests/conftest.py` refuses any database name that does not end in `_test`.
- Database tests use a synthetic 4 x 4 grid of tracts near -99.80, 33.00 with a stacked cell and a large ranch tract. Add fixtures there, never real owner data.
- One file: `python3 -m pytest -q tests/test_entries_db.py`; one test: add `-k name`.
- Report: number passed, failed, and skipped, plus the first failure's assertion. Paste the failing output, do not paraphrase it.
- A test that touches the import code must keep `test_import_code_has_no_path_to_user_entered_tables` passing.
