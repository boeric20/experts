---
name: maplibre-conventions
description: How the Landman Command map is built with MapLibre GL JS - sources, layer ids, the layer registry, click handling, labels, fallback style, and performance rules. Use when changing anything the map draws or how it responds.
---
# Map conventions

Files: `frontend/src/components/MapView.tsx` (map instance, sources, layers, events), `frontend/src/lib/layers.ts` (registry of user-facing layers and groups), `frontend/src/app/page.tsx` (state passed to the map).

Layer ids in use
- County parcels: `parcels-fill`, `parcels-line`; selected record: `selected-line`.
- Projects: `proj-parcels-fill`, `proj-parcels-line`, `proj-boundary-line`, `proj-refpoly-fill`, `proj-refpoly-line`, `proj-road-line`, `proj-point-circle`. Project name labels are DOM markers (`.proj-label`), not symbol layers.
- GPS: `me-accuracy-fill`, `me-dot`; track: `track-line`.
- Fallback: `fallback-background` when the online style fails to load.

Registry
- Groups in `layers.ts`: basemap, gps, parcels, project, infrastructure, energy, records, field. Each user-facing layer maps to one or more MapLibre layer ids (`mapLayerIds`). A new map layer must be added to the registry so the Layers panel and truck mode control it.

Interaction
- One click handler queries `parcels-fill` and `proj-parcels-fill` so project parcels are tappable at any zoom; it calls `onSelectParcel(id | null, lon, lat)`, and the page asks the backend for every record at that point.
- Programmatic moves (`fitTo`) set a flag so they do not count as the user panning.

Rules
- Add sources and layers once after the style loads (the `ready` counter); update data with `setData`, not by re-adding layers.
- Keep per-frame and per-GPS-fix work minimal; debounce view-change callbacks.
- Parcels in a view are capped by the API; the UI says so when capped.
- Any new basemap or tile source needs a licence that permits this use; satellite imagery stays off unless the owner supplies a licensed URL (`NEXT_PUBLIC_SATELLITE_TILES`).
