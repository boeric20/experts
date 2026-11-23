---
name: spatial-sql-patterns
description: PostGIS patterns used in Landman Command - storage CRS, area on geography, overlap and inclusion rules, union for acreage, geometry identity hashes, and spatial indexes. Use when writing or reviewing spatial SQL or geometry logic.
---
# Spatial SQL patterns

Storage and units
- Geometry is stored in EPSG:4326 (`geometry(MultiPolygon, 4326)` and similar).
- Area: `ST_Area(geom::geography) / 4046.8564224` gives acres (`SQ_M_PER_ACRE` in `services/projects.py`). Never take area of raw 4326 geometry (square degrees).
- Distance: `ST_Distance(a::geography, b::geography)` in metres, or `ST_DWithin(a::geography, b::geography, metres)` for "within" tests.

Acreage without double counting
- Overlapping tracts, multipart shapes, and stacked accounts must not be summed: use `ST_Area(ST_Union(geom)::geography)`.
- Report calculated acreage next to the county's legal acreage; never replace one with the other.

Project parcels
- A project parcel is a snapshot of a county tract: `geom_hash = md5(ST_AsBinary(geom))`, which equals the county parcel's `shape_key`. Join user data on project parcel UUIDs, never on `parcel.id`.
- Inclusion rule: overlap >= 1 acre or >= 5% of the tract is included; smaller is an edge parcel offered unticked; under 0.01 acre is ignored (`INCLUDE_MIN_ACRES`, `INCLUDE_MIN_FRACTION`, `IGNORE_BELOW_ACRES`).
- Warn when 15% or more of a boundary has no county parcels under it (`UNCOVERED_WARN_FRACTION`).

Point queries
- Records at a point: `ST_Intersects(geom, ST_SetSRID(ST_Point(lon, lat), 4326))`, ordered smallest area first (most specific tract), returning every stacked record.

Validity and performance
- Make input valid with `ST_MakeValid` and keep polygon types with `ST_CollectionExtract(..., 3)`.
- Every geometry column used in a filter has a GiST index. Check plans with `EXPLAIN (ANALYZE, BUFFERS)`.
- Prefilter with `&&` or `ST_Intersects` before expensive `ST_Intersection`.

Testing
- Use the synthetic grid in `backend/tests/conftest.py` (cell 0.005 degrees, about 64 acres) and compare results with an independent calculation for at least one case.
