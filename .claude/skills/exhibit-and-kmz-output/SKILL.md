---
name: exhibit-and-kmz-output
description: Standards for maps and files Landman Command produces for other people - property exhibits, print layouts, and KMZ exports for Google Earth - including required map elements, labelling, and checks. Use when building or reviewing any exhibit or export.
---
# Exhibits and KMZ output

Every exhibit shows
- Title (project or tract), date produced, and who produced it.
- North arrow, scale bar, and a legend for every symbol used.
- Data sources with vintage (for example "Parcels: Haskell CAD via TxGIO StratMap, 2026-06-01").
- Statement: "For planning only. Not a survey. Boundaries and infrastructure are approximate."
- Calculated acreage labelled as calculated; county acreage labelled as county record.

Layout
- Letter or tabloid, landscape by default; legible at print size; parcel labels do not collide.
- Project colour for the boundary; neutral for county parcels; distinct, colour-blind-safe colours for infrastructure.

KMZ export
- WGS84 coordinates; one folder per layer (boundary, parcels, roads, infrastructure); a style per layer.
- Each placemark description holds the source, vintage, and calculated acreage; no landowner contact details or notes unless the user explicitly includes them.
- Re-import the file with the app's importer and open it in Google Earth before calling it done.

QGIS path
- Optional exhibits use `backend/app/services/qgis_bridge.py` and need a local QGIS with the QGIS MCP plugin (`.mcp.json`). It has not been tested against a live QGIS; test before relying on it.
