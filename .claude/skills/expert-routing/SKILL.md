---
name: expert-routing
description: The Landman Command team directory and routing rules - which expert covers which topic, how to choose the fewest experts for a question, and how to run and combine a consultation. Used by the orchestrator and the team architect.
user-invocable: false
---
# Team directory and routing

The full roster with descriptions is in `docs/expert-roster.md`. Agent files are in `.claude/agents/`.

## Who covers what
| Topic | First choice | Add when needed |
| --- | --- | --- |
| Scope, requirements, priorities | product-manager | landman-workflow-advisor |
| Who owns land, chain of title, probate, heirship | texas-title-examiner | public-records-researcher |
| Appraisal parcel data, accounts, owner fields | appraisal-district-analyst | data-quality-analyst |
| Legal descriptions, surveys, abstracts, metes and bounds | legal-description-specialist | geospatial-data-engineer |
| Leases, options, easements, right-of-way | land-agreements-analyst | landman-workflow-advisor |
| Daily landman workflow, outreach, follow-ups | landman-workflow-advisor | ux-designer |
| Where a record lives, access, terms | public-records-researcher | licensing-compliance-analyst |
| Transmission lines, substations | transmission-infrastructure-analyst | gis-engineer |
| ERCOT queue, interconnection, large loads | ercot-interconnection-analyst | transmission-infrastructure-analyst |
| Pipelines, wells, Railroad Commission | pipeline-rrc-analyst | gis-engineer |
| Floodplain, wetlands, setbacks, buildable area | site-constraints-analyst | geospatial-data-engineer |
| Map display, layers, tiles, offline maps | gis-engineer | performance-engineer |
| File formats, CRS, spatial SQL, area and overlap | geospatial-data-engineer | database-engineer |
| GPS, tracking, field hardware | gps-field-systems-engineer | field-ux-specialist |
| Exhibits, print maps, KMZ export | exhibit-cartographer | geospatial-data-engineer |
| Importing and cleaning records data | land-records-engineer | data-quality-analyst |
| Schema, migrations, query speed, backups | database-engineer | performance-engineer |
| Data problems, coverage, duplicates | data-quality-analyst | appraisal-district-analyst |
| Interface code | frontend-ux-engineer | ux-designer |
| Screen design and flows | ux-designer | landman-workflow-advisor |
| Truck mode, touchscreen, outdoor use | field-ux-specialist | gps-field-systems-engineer |
| API and backend code | backend-platform-engineer | database-engineer |
| Docker, Mac setup, updates, releases, CI, hosting | devops-release-engineer | security-architect |
| Slowness | performance-engineer | gis-engineer or database-engineer |
| AI features, document analysis, automation | ai-automation-engineer | land-records-engineer |
| Tests, review, regressions | qa-security-engineer | none |
| Security, privacy, logins, exposure | security-architect | qa-security-engineer |
| Instructions, guides, release notes | technical-writer | devops-release-engineer |
| Licences and terms of use | licensing-compliance-analyst | public-records-researcher |
| New agents or skills, improving the team | team-architect | none |

## Choosing experts
- Use the fewest experts that cover the question: usually one to three, rarely more than four.
- A pure fact lookup or a question inside one area needs one expert.
- Add qa-security-engineer for anything that will be built; add security-architect when data leaves the Mac, logins, hosting, or network exposure are involved.
- Add licensing-compliance-analyst before recommending any new dataset, imagery, or library.

## Running a consultation
- Independent questions go to experts in parallel; dependent ones in sequence (the second gets the first's answer).
- Give each expert a self-contained prompt: the question, the context they need, the files to look at, "consultation only, do not change files", and the answer format from the `expert-consultation` skill.
- When experts disagree, state both positions, the evidence for each, and your recommendation.
- Never pass a `model` when starting an expert; its file sets the model (`docs/agent-brains.md`).
- Each expert reads its own `knowledge/<agent-name>/` folder before answering; mention in the brief if the Product Owner pointed to a document there.
