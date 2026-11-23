---
name: geo-file-formats
description: Reading and writing KML, KMZ, GeoJSON, and shapefiles in Landman Command - parser behaviour, limits, coordinate systems, boundary detection, and safety. Use when importing or exporting spatial files.
---
# Spatial file formats

Importer: `backend/app/services/kml_features.py` (`parse_project_file`). It keeps each shape with its name, folder path, placemark id, attributes, geometry kind (polygon, line, point), calculated acres, and geometry hash.

Formats
- KMZ: a zip holding `doc.kml` (or another `.kml`) plus images. Overlays and models are skipped and reported.
- KML: coordinates are longitude,latitude[,altitude] in WGS84. Folders become `folder_path`.
- GeoJSON: RFC 7946 says WGS84 longitude/latitude; reject or reproject anything declaring another CRS.
- Shapefile: needs `.shp`, `.shx`, `.dbf`, and `.prj`; read the `.prj` and reproject to EPSG:4326 (GeoPandas/pyogrio). Never assume the CRS when `.prj` is missing; ask.

Limits and safety
- `MAX_FEATURES = 20,000` shapes; `MAX_KML_BYTES = 200 MB` uncompressed KML inside a KMZ. Check sizes before reading a zip member (zip bombs).
- Parse XML without fetching external entities or DTDs. Review Python's XML security notes before changing the parser.
- Reject files that parse to nothing with a clear message; never create a half-imported project.

Boundary choice
- Suggest polygons whose name or folder matches `bound|perimeter|outline|project area|site area|site`; otherwise the largest polygon. The user confirms.

Export (future KMZ)
- Write WGS84, one folder per layer, styles per layer, and a description holding source and date. Validate by re-reading the file with the importer and opening it in Google Earth.
