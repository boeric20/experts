---
name: landowner-data-privacy
description: How Landman Command handles personal and confidential data - landowner names, addresses, phones, emails, notes, agreements, employer information, backups, and outside services. Use whenever a feature stores, shows, exports, or sends such data.
---
# Landowner and confidential data

What counts
- Personal data: landowner and contact names, mailing addresses, phone numbers, emails, notes about people, call and meeting logs.
- Confidential business data: project boundaries before announcement, agreement terms, offers, anything from the owner's employer.

Rules
- Stored only in the local database on the owner's Mac. `backups/` dumps contain it and are gitignored; treat them as sensitive.
- Never committed to git, never in test fixtures (use synthetic names), never in screenshots or reports beyond what the Product Owner needs.
- Not sent to any outside service (AI APIs, geocoders, analytics, cloud storage) without the Product Owner's explicit approval of that specific data flow.
- Exports (KMZ, exhibits, CSV) include personal data only when the user chooses to include it.
- Collect only what the workflow needs.
- Employer systems (Salesforce, SharePoint, paid land-record services) are not accessed without approved access methods.
- Once other users exist, every record has an owner and access is checked on every request.

Privacy and breach-notification laws apply to some of this data; this is compliance guidance, not legal advice. Escalate questions to the Product Owner.
