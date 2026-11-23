---
name: security-checklist
description: Security review checklist for Landman Command - network exposure, authentication, input handling, SQL, uploads, secrets, personal data, and dependencies, with this app's known risks. Use when reviewing a change or designing anything that touches data, access, or the network.
---
# Security checklist

Known state (2026-11-22; re-check)
- No logins. The database port is bound to 127.0.0.1, but `docker-compose.yml` publishes the backend (8000) and frontend (3000) on all interfaces, so the app is reachable from the local network.
- Next.js 14.2.18 is below the patched 14.2.x release in Next.js security advisories (14.2.35 per the 2025-12-11 advisory). Re-check for newer advisories.
- `.claude/settings.json` denies Claude reading `.env`, `.env.local`, and `backups/`.

For every change, check
- **Exposure:** new ports, CORS origins, or hosts? Anything reachable beyond the Mac?
- **Access:** once logins exist, every route checks who is asking.
- **Input:** Pydantic models with limits; uploads limited in size and count; zip members checked before reading; XML parsed without external entities.
- **SQL:** parameters only; no string-built SQL from user input.
- **Output:** user text rendered as text, never as HTML (`dangerouslySetInnerHTML` is a finding).
- **Secrets:** none in code, logs, commits, test fixtures, or reports. `.env` stays ignored.
- **Personal data:** landowner names, addresses, phones, emails, and notes stay local; nothing sent to outside services without the Product Owner's approval; backups treated as sensitive.
- **Employer data:** never pulled from employer systems without approval; never committed.
- **Data loss:** deletes recoverable unless approved; migrations do not drop user data.
- **Dependencies:** new or upgraded packages checked for advisories and licence (`dependency-audit`).

Report findings ranked by real impact for this app, each with a concrete scenario, `path:line`, and a fix.
