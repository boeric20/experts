---
name: energy-infrastructure-sources
description: Landscape of public data for Texas energy infrastructure in Landman Command - transmission and substations, ERCOT interconnection, generation, pipelines and wells, and environmental constraint layers - with status notes that must be re-verified. Use when planning or answering questions about infrastructure layers.
---
# Energy and infrastructure data sources

Starting point: `docs/01-integration-feasibility-matrix.md` (verified 2026-11; re-check before relying on any entry). Database tables already exist for `transmission_line`, `substation`, `pipeline`, `generating_facility`, `interconnection_request`, `regulatory_filing`, `environmental_feature`, each with a status (existing, proposed, under construction or abandoned, unknown) and status evidence. No ingestion or map layer exists yet.

Transmission and substations
- HIFLD electric transmission and substation layers: the HIFLD Open portal was reported deactivated 2025-08-26; mirrors and archives exist with different vintages. Treat as a dated snapshot and show the vintage.
- Utility and ERCOT planning documents and PUCT transmission certification (CCN) dockets for proposed lines.

ERCOT
- Public API (registration and terms required; data from 2023-12-11).
- Generator Interconnection Status report: periodic spreadsheet, not an API. Queue entries are applications.
- Large-load interconnection rules changed recently; check current ERCOT and PUCT rules before advising.

Pipelines and wells
- Railroad Commission of Texas: pipeline layers and well data as county shapefile downloads; reported to use NAD27 coordinates that must be reprojected. Check current terms and update cadence.
- Federal pipeline maps limit public access; do not assume availability.

Generation and energy data
- EIA API v2 (free key) and EIA-860M monthly generator inventory for existing and planned plants.

Constraints (site screening)
- FEMA flood hazard layers, USFWS wetlands inventory, USGS elevation for slope, TxDOT roads. Check scale and currency; screening only.

Rules
- Infrastructure geometry from public data is approximate. Never use it for excavation or safety decisions; say so in the UI.
- Every feature: source, vintage, status, and evidence.
