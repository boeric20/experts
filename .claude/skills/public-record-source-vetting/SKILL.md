---
name: public-record-source-vetting
description: Checklist for vetting any data source or website before Landman Command uses it - availability, publisher, licence and terms, automated-access rules, cost, update frequency, format, accuracy, and how to record the result. Use before recommending or integrating a source.
---
# Vetting a source

For every source, check on the web and record (with the date checked):
1. **Publisher and authority**: who produces it; official or a mirror.
2. **Availability**: current URL works; whether it was retired, moved, or frozen (example: the HIFLD Open portal was reported deactivated on 2025-08-26; mirrors vary in vintage).
3. **Licence and terms of use**: quote the clause that permits or restricts use, redistribution, and automated access. Respect robots rules and rate limits.
4. **Access method**: bulk download, API (registration, key, quotas), document downloads, or viewer only. Note anything that requires login or payment.
5. **Cost**: free, registration, per-record fee, subscription.
6. **Update frequency and vintage**: how current, and how to tell the vintage of a file.
7. **Format and CRS**: file types, coordinate system (for example NAD27 in some Railroad Commission files), field definitions.
8. **Accuracy and limits**: positional accuracy, completeness, known gaps.
9. **Verification status** to assign: confirmed, reported, or unconfirmed.

Stop and report instead of proceeding when the source needs a paid account, a login, employer access, or terms that forbid the intended use.

Record results in `docs/01-integration-feasibility-matrix.md` (or a note under `docs/research/` when asked) using its legend.
