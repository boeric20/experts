---
name: provenance-and-verification
description: Landman Command's rules for where data comes from and how sure we are - source, vintage, verification status, calculated versus record figures, and never presenting appraisal or AI output as title. Use whenever data is loaded, shown, summarised, or recommended.
---
# Provenance and verification

Every external record carries
- **Source**: who published it and the dataset name (`source_dataset`).
- **Vintage**: the date the data describes or was acquired (for StratMap parcels, `DATE_ACQ`), plus the date retrieved.
- **Verification status**: `confirmed` (checked directly against the publisher), `reported` (found via the publisher or a credible mirror, not probed), `unconfirmed` (needs a human check). Same legend as `docs/01-integration-feasibility-matrix.md`.

Labels in the interface and in answers
- "calculated" for anything the app computes from geometry (acreage, overlap, distance).
- "county record" or "appraisal record" for appraisal data. It describes taxable accounts as of the appraisal date, not ownership of title.
- "from <source>, <date>" for infrastructure, queue, and environmental data, with status (existing, proposed, under construction, unknown) and the evidence for that status.
- AI-generated summaries are drafts: show the sources they used and say a person must confirm them.

Never
- Present appraisal ownership, a mapped shape, or an AI summary as confirmed title or a survey.
- Silently reconcile two figures (for example calculated vs legal acreage). Show both and the difference.
- Use a source whose availability, licence, or terms you have not checked. Record the URL and the date you checked.
- Copy data from employer systems or paid services without the Product Owner's approval.

When unsure, say "unverified" and what check would settle it.
