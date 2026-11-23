---
name: write-migration
description: Add a database migration to Landman Command safely - numbered SQL file or Python step, run at backend startup, safe on the owner's existing database - and test it. Use for any schema or data change.
---
# Writing a migration

Rules
- `db/init/` runs only for a brand-new database. Every change that must reach an existing database is a migration.
- Never edit or renumber an applied migration. Add the next number.
- Additive changes (new table, new nullable column, new index) are routine. Dropping, renaming, or rewriting anything that holds user data needs the Product Owner's approval first, through the Lead.
- Each migration runs in one transaction with an advisory lock and is recorded in `schema_migration`. It must succeed on an empty database and on a populated one.

Steps
1. SQL: create `backend/app/migrations/sql/NNNN_short_name.sql` (next number after the highest in that folder and in `PYTHON_STEPS`).
   Python (when application code is needed): add a function to `backend/app/migrations/steps.py` and register it in `PYTHON_STEPS` under the next number.
2. Start the comment block with what the migration does to existing data, in plain words.
3. Add the version to the expected list in `test_migrations_are_recorded_and_do_not_rerun` (`backend/tests/test_projects_db.py`).
4. Write a test that creates data in the old shape, applies the migration logic, and checks the result (see `test_old_notes_boxes_become_entries` in `backend/tests/test_entries_db.py`).
5. Run `run-backend-tests`. Then start the backend against a scratch database that already has data and confirm `/health` lists the migration.
6. In the delivery report, state what the migration does to the owner's database and that a backup (`sh backup.sh`) should be taken before updating.
