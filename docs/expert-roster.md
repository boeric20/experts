# Expert Roster

The Landman Command AI team: every agent, what it covers, and the skills it uses. Agent files are in `.claude/agents/`; skills in `.claude/skills/<name>/SKILL.md`. Maintained by the `team-architect` agent; changes to the team update this file, the routing table in `.claude/skills/expert-routing/SKILL.md`, and `CLAUDE.md` together.

**31 agents** (29 experts, the orchestrator, and the team architect) and **31 skills**. Created 2026-11-22. Each agent's model, first name, voice, and working style are in `docs/agent-brains.md`; each has a knowledge folder at `knowledge/<agent-name>/`.

## Coordinating agents

| Agent | Role | Skills |
| --- | --- | --- |
| `orchestrator` | Takes any question or request, decides which experts on the Landman Command team to bring in, has them work on it in parallel or in sequence, reconciles their findings, and returns one combined answer. Use for questions that cross more than one area of expertise. | `expert-routing`, `proposal-format`, `provenance-and-verification` |
| `team-architect` | Meta agent that creates new agents and skills for this project and improves existing ones: writes the files, wires skills to agents, updates the roster, routing, and CLAUDE.md, and validates everything. Use when the team needs a new expert, a new skill, or a fix to how an agent behaves. | `agent-and-skill-authoring`, `expert-routing` |

## Coordination

| Agent | Covers | Kind | Skills |
| --- | --- | --- | --- |
| `product-manager` | Turns the Product Owner's ideas into clear requirements, user stories, acceptance criteria, and priorities for Landman Command. Use when a request is vague, when scoping a feature, or when deciding what to build next. | advises | `expert-consultation`, `proposal-format` |

## Land, title, and records

| Agent | Covers | Kind | Skills |
| --- | --- | --- | --- |
| `texas-title-examiner` | Texas surface title research expert: chain of title, deeds, probate and heirship, curative issues, and how ownership research should work in Landman Command. Use for questions about who owns land and how to prove it from records. | advises | `expert-consultation`, `texas-land-title-basics`, `texas-legal-descriptions`, `provenance-and-verification` |
| `appraisal-district-analyst` | Expert in Texas county appraisal district (CAD) parcel data and the TxGIO StratMap parcel layer: accounts, owners, stacked records, legal descriptions, field meanings, and data quirks. Use for questions about what parcel data means or why it looks wrong. | advises | `expert-consultation`, `texas-appraisal-data`, `provenance-and-verification` |
| `legal-description-specialist` | Expert in Texas legal descriptions: original surveys and abstracts, railroad section-block surveys, metes and bounds, varas, calls, and how descriptions relate to mapped parcels. Use when parsing, comparing, or mapping legal descriptions. | advises | `expert-consultation`, `texas-legal-descriptions`, `spatial-sql-patterns` |
| `land-agreements-analyst` | Expert in surface leases, solar, wind, and data-center ground leases, options, easements, and right-of-way agreements, and in how to track them in Landman Command. Use for lease or agreement data models, terms, and deadlines. | advises | `expert-consultation`, `land-agreements-basics`, `landowner-data-privacy` |
| `landman-workflow-advisor` | Practising-landman perspective on daily workflow: landowner outreach, contact logging, follow-ups, project status, field visits, and what the app must make fast. Use to test whether a feature fits how a landman actually works. | advises | `expert-consultation`, `land-agreements-basics`, `landowner-data-privacy`, `texas-appraisal-data` |
| `public-records-researcher` | Finds and vets Texas public-record sources: county clerk indexes, appraisal district sites, GLO, TxGIO, and state agencies, including access methods, costs, and terms of use. Use before integrating or recommending any records source. | advises | `expert-consultation`, `public-record-source-vetting`, `provenance-and-verification`, `texas-land-title-basics` |

## Energy and infrastructure

| Agent | Covers | Kind | Skills |
| --- | --- | --- | --- |
| `transmission-infrastructure-analyst` | Expert in electric transmission lines, substations, voltage classes, CCN proceedings, and public sources for Texas transmission infrastructure. Use for transmission or substation layers, proximity questions, and routing context. | advises | `expert-consultation`, `energy-infrastructure-sources`, `public-record-source-vetting`, `provenance-and-verification` |
| `ercot-interconnection-analyst` | Expert in ERCOT generation and large-load interconnection, interconnection queue reports, planning studies, and how to present them in Landman Command. Use for queue data, project status, and grid context. | advises | `expert-consultation`, `energy-infrastructure-sources`, `public-record-source-vetting`, `provenance-and-verification` |
| `pipeline-rrc-analyst` | Expert in Texas pipelines and oil and gas infrastructure from the Railroad Commission of Texas and federal sources: pipeline layers, operators, wells, and permits. Use for pipeline layers, crossings, and setbacks. | advises | `expert-consultation`, `energy-infrastructure-sources`, `public-record-source-vetting`, `provenance-and-verification` |
| `site-constraints-analyst` | Expert in site screening for solar, wind, storage, and data-center projects: floodplains, wetlands, slope, roads, setbacks, environmental features, and buildable-area estimates. Use for constraint layers and suitability analysis. | advises | `expert-consultation`, `energy-infrastructure-sources`, `public-record-source-vetting`, `spatial-sql-patterns` |

## GIS and mapping

| Agent | Covers | Kind | Skills |
| --- | --- | --- | --- |
| `gis-engineer` | Map and geospatial front-end engineer: MapLibre GL JS, PMTiles, layers and styling, map interaction and performance, offline tiles. Use proactively when a task touches the map display or how the map behaves. | builds code | `expert-consultation`, `maplibre-conventions`, `ui-conventions`, `run-frontend-checks`, `browser-check` |
| `geospatial-data-engineer` | Backend geospatial engineer: KML, KMZ, GeoJSON, and shapefile parsing, coordinate reference systems, PostGIS spatial SQL, overlap and area calculations, and geometry quality. Use for spatial processing in the backend. | builds code | `expert-consultation`, `spatial-sql-patterns`, `geo-file-formats`, `run-backend-tests` |
| `gps-field-systems-engineer` | Expert in GPS and positioning: browser geolocation, accuracy, heading, track recording, external GNSS receivers, and vehicle-mounted computer setups. Use for anything about position, tracking, or field hardware. | builds code | `expert-consultation`, `gps-accuracy-practices`, `maplibre-conventions`, `run-frontend-checks` |
| `exhibit-cartographer` | Cartography and output specialist: property exhibits, print layouts, map symbology, KMZ export for Google Earth, and the QGIS exhibit bridge. Use for anything the app produces for other people to look at. | builds code | `expert-consultation`, `exhibit-and-kmz-output`, `geo-file-formats`, `provenance-and-verification` |

## Data and databases

| Agent | Covers | Kind | Skills |
| --- | --- | --- | --- |
| `land-records-engineer` | Data engineer for land records: county parcel ingestion, public-record pipelines, data cleaning and standardisation, provenance, and the record data model. Use for importing, cleaning, or modelling records data. | builds code | `expert-consultation`, `texas-appraisal-data`, `provenance-and-verification`, `write-migration`, `run-backend-tests` |
| `database-engineer` | Database engineer: schema design, migrations, indexes, query performance, integrity, backup and restore for PostgreSQL 16 with PostGIS. Use for any schema change, slow query, or data-safety question. | builds code | `expert-consultation`, `write-migration`, `spatial-sql-patterns`, `run-backend-tests` |
| `data-quality-analyst` | Checks data for completeness, consistency, duplicates, coverage gaps, and provenance problems, and writes data-quality reports. Use after loading new data or when figures look wrong. | advises | `expert-consultation`, `provenance-and-verification`, `texas-appraisal-data`, `spatial-sql-patterns` |

## Software engineering

| Agent | Covers | Kind | Skills |
| --- | --- | --- | --- |
| `frontend-ux-engineer` | Frontend engineer for React, Next.js, and TypeScript: components, panels, pages, forms, search and filters, state, and accessibility across laptop, phone, and truck screen. Use for building or fixing interface code. | builds code | `expert-consultation`, `ui-conventions`, `run-frontend-checks`, `browser-check`, `cloud-dev-environment` |
| `ux-designer` | Designs layouts, flows, and interactions before code: information architecture, screen layouts, wording, and usability. Use when a feature needs a design or a screen feels confusing. | advises | `expert-consultation`, `ui-conventions`, `proposal-format` |
| `field-ux-specialist` | Designs for use in the field and in a vehicle: truck mode, glove-friendly touch targets, sunlight readability, glanceable information, and driver safety. Use for truck mode, touchscreen, or outdoor usability. | advises | `expert-consultation`, `ui-conventions`, `gps-accuracy-practices` |
| `backend-platform-engineer` | Backend engineer for FastAPI and psycopg: API routes, services, transactions, error handling, integrations, and authentication design. Use for building or fixing backend code and APIs. | builds code | `expert-consultation`, `api-conventions`, `write-migration`, `run-backend-tests`, `cloud-dev-environment` |
| `devops-release-engineer` | Owns Docker, local setup on the owner's Mac, the update, backup, and restore scripts, versioning, CI, and future hosting. Use for build failures, setup problems, releases, and deployment questions. | builds code | `expert-consultation`, `cloud-dev-environment`, `release-handover`, `mac-owner-instructions`, `dependency-audit` |
| `performance-engineer` | Finds and fixes slowness: map rendering, API latency, spatial query plans, bundle size, and memory. Use when something feels slow or before loading much larger data. | builds code | `expert-consultation`, `spatial-sql-patterns`, `maplibre-conventions`, `cloud-dev-environment` |
| `ai-automation-engineer` | Designs and builds AI-assisted features: document analysis, research automation, ownership summaries, and generated reports, with sources attached and human review. Use for any feature that uses a language model or automates research. | builds code | `expert-consultation`, `api-conventions`, `provenance-and-verification`, `landowner-data-privacy` |

## Quality and security

| Agent | Covers | Kind | Skills |
| --- | --- | --- | --- |
| `qa-security-engineer` | Independent quality gate: reviews every change, runs backend, frontend, and browser tests, checks regressions, data safety, and GIS accuracy, and gives a pass or fail verdict. Use after any implementation and for test-suite work. | builds code | `expert-consultation`, `run-backend-tests`, `run-frontend-checks`, `browser-check`, `security-checklist`, `cloud-dev-environment` |
| `security-architect` | Security and privacy design: network exposure, authentication and access control, secrets, dependency risk, input handling, and protection of landowner and employer data. Use for security reviews, threat models, and before adding logins or hosting. | advises | `expert-consultation`, `security-checklist`, `dependency-audit`, `landowner-data-privacy` |

## Product, documentation, and compliance

| Agent | Covers | Kind | Skills |
| --- | --- | --- | --- |
| `technical-writer` | Writes clear documentation: user guides, beginner step-by-step instructions for the owner's Mac, release notes, and developer docs. Use when something needs explaining in writing. | advises | `expert-consultation`, `mac-owner-instructions`, `delivery-report` |
| `licensing-compliance-analyst` | Checks licences and terms for data sources, imagery, libraries, and APIs, and the rules for handling personal and employer data. Use before adopting any dataset, library, or service. | advises | `expert-consultation`, `public-record-source-vetting`, `landowner-data-privacy` |

## Skills

| Skill | What it gives | Used by |
| --- | --- | --- |
| `agent-and-skill-authoring` (command) | How to write and maintain Claude Code subagents (.claude/agents/*.md) and skills (.claude/skills/<name>/SKILL.md) for this project | `team-architect` |
| `api-conventions` | Backend conventions for Landman Command | `backend-platform-engineer`, `ai-automation-engineer` |
| `ask-team` (command) | Ask the Landman Command expert team a question | you, as `/ask-team` |
| `browser-check` | Exercise a Landman Command feature in a real browser with Playwright at desktop and phone sizes, check for page errors, and look at screenshots | `gis-engineer`, `frontend-ux-engineer`, `qa-security-engineer` |
| `cloud-dev-environment` | Start Landman Command in a Claude Code cloud session (or any Linux container) | `frontend-ux-engineer`, `backend-platform-engineer`, `devops-release-engineer`, `performance-engineer`, `qa-security-engineer` |
| `delivery-report` | Template for reporting finished work to the Landman Command Product Owner | `technical-writer` |
| `dependency-audit` | Check Landman Command's npm and Python dependencies for security advisories, outdated versions, and licences, using current web sources | `devops-release-engineer`, `security-architect` |
| `energy-infrastructure-sources` | Landscape of public data for Texas energy infrastructure in Landman Command | `transmission-infrastructure-analyst`, `ercot-interconnection-analyst`, `pipeline-rrc-analyst`, `site-constraints-analyst` |
| `exhibit-and-kmz-output` | Standards for maps and files Landman Command produces for other people | `exhibit-cartographer` |
| `expert-consultation` (background) | How a Landman Command expert answers a consultation from the orchestrator or the Lead Architect | `product-manager`, `texas-title-examiner`, `appraisal-district-analyst`, `legal-description-specialist`, `land-agreements-analyst`, `landman-workflow-advisor`, `public-records-researcher`, `transmission-infrastructure-analyst`, `ercot-interconnection-analyst`, `pipeline-rrc-analyst`, `site-constraints-analyst`, `gis-engineer`, `geospatial-data-engineer`, `gps-field-systems-engineer`, `exhibit-cartographer`, `land-records-engineer`, `database-engineer`, `data-quality-analyst`, `frontend-ux-engineer`, `ux-designer`, `field-ux-specialist`, `backend-platform-engineer`, `devops-release-engineer`, `performance-engineer`, `ai-automation-engineer`, `qa-security-engineer`, `security-architect`, `technical-writer`, `licensing-compliance-analyst` |
| `expert-routing` (background) | The Landman Command team directory and routing rules | `orchestrator`, `team-architect` |
| `geo-file-formats` | Reading and writing KML, KMZ, GeoJSON, and shapefiles in Landman Command | `geospatial-data-engineer`, `exhibit-cartographer` |
| `gps-accuracy-practices` | GPS and positioning rules for Landman Command | `gps-field-systems-engineer`, `field-ux-specialist` |
| `improve-team` (command) | Ask the team architect to add a new expert agent or skill to the Landman Command team, or to improve an existing one | you, as `/improve-team` |
| `land-agreements-basics` | Background on surface land agreements a Texas landman tracks in Landman Command | `land-agreements-analyst`, `landman-workflow-advisor` |
| `landowner-data-privacy` | How Landman Command handles personal and confidential data | `land-agreements-analyst`, `landman-workflow-advisor`, `ai-automation-engineer`, `security-architect`, `licensing-compliance-analyst` |
| `mac-owner-instructions` | How to write instructions the Landman Command owner follows on their Mac | `devops-release-engineer`, `technical-writer` |
| `maplibre-conventions` | How the Landman Command map is built with MapLibre GL JS | `gis-engineer`, `gps-field-systems-engineer`, `performance-engineer` |
| `proposal-format` | Template for a Landman Command development proposal that the Product Owner approves before work starts | `product-manager`, `ux-designer`, `orchestrator` |
| `provenance-and-verification` | Landman Command's rules for where data comes from and how sure we are | `texas-title-examiner`, `appraisal-district-analyst`, `public-records-researcher`, `transmission-infrastructure-analyst`, `ercot-interconnection-analyst`, `pipeline-rrc-analyst`, `exhibit-cartographer`, `land-records-engineer`, `data-quality-analyst`, `ai-automation-engineer`, `orchestrator` |
| `public-record-source-vetting` | Checklist for vetting any data source or website before Landman Command uses it | `public-records-researcher`, `transmission-infrastructure-analyst`, `ercot-interconnection-analyst`, `pipeline-rrc-analyst`, `site-constraints-analyst`, `licensing-compliance-analyst` |
| `release-handover` | Hand a finished Landman Command version to the owner | `devops-release-engineer` |
| `run-backend-tests` | Run the Landman Command backend test suite (pytest) against a throwaway PostGIS database and report real results | `geospatial-data-engineer`, `land-records-engineer`, `database-engineer`, `backend-platform-engineer`, `qa-security-engineer` |
| `run-frontend-checks` | Run the Landman Command frontend checks | `gis-engineer`, `gps-field-systems-engineer`, `frontend-ux-engineer`, `qa-security-engineer` |
| `security-checklist` | Security review checklist for Landman Command | `qa-security-engineer`, `security-architect` |
| `spatial-sql-patterns` | PostGIS patterns used in Landman Command | `legal-description-specialist`, `site-constraints-analyst`, `geospatial-data-engineer`, `database-engineer`, `data-quality-analyst`, `performance-engineer` |
| `texas-appraisal-data` | Texas county appraisal district (CAD) parcel data as used in Landman Command | `appraisal-district-analyst`, `landman-workflow-advisor`, `land-records-engineer`, `data-quality-analyst` |
| `texas-land-title-basics` | Background on Texas surface title research for Landman Command | `texas-title-examiner`, `public-records-researcher` |
| `texas-legal-descriptions` | Reading Texas legal descriptions for Landman Command | `texas-title-examiner`, `legal-description-specialist` |
| `ui-conventions` | Interface conventions for Landman Command | `gis-engineer`, `frontend-ux-engineer`, `ux-designer`, `field-ux-specialist` |
| `write-migration` | Add a database migration to Landman Command safely | `land-records-engineer`, `database-engineer`, `backend-platform-engineer` |

**Kinds:** *builds code* agents may change files when the Product Owner has approved the work; *advises* agents research and recommend, and may write notes under `docs/research/` when asked. All experts are consultation-only by default and cannot start other agents.
