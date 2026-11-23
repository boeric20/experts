---
name: texas-appraisal-data
description: Texas county appraisal district (CAD) parcel data as used in Landman Command - TxGIO StratMap Land Parcels fields, accounts and stacked records, owner and address fields, vintage, and known quirks in the Haskell County file. Use when interpreting, importing, or displaying parcel and owner data.
---
# Texas appraisal parcel data

What it is
- Each Texas county has an appraisal district that values property for tax. Records describe tax accounts and the owner on the appraisal roll, which lags real conveyances. It is not title.
- TxGIO's StratMap Land Parcels program collects CAD parcel geometry and attributes into one statewide schema, published per county. Check the current year's release and terms on the TxGIO data hub before loading.

Fields mapped by `backend/app/ingest/parcels_stratmap.py`
- `PROP_ID` account number (prop_id), `GEO_ID` geographic id, `OWNER_NAME`, `NAME_CARE` (care-of), `MAIL_ADDR`/`MAIL_CITY`/`MAIL_STAT`/`MAIL_ZIP`, `SITUS_ADDR`, `LEGAL_DESC`, `LEGAL_AREA` with `LGL_AREA_UNIT`, `LAND_VALUE`, `IMP_VALUE`, `MKT_VALUE`, `TAX_YEAR`, `STAT_LAND_USE`, `LOC_LAND_USE`, `SOURCE`, `FIPS`, `COUNTY`; vintage from `DATE_ACQ`.

Stacked records
- Several accounts can share one mapped shape (undivided interests, separately assessed interests, or small tracts drawn on a larger one). The app lists every record at a point, most specific tract first.
- A project parcel is the tract (shape) and carries every account on it.

Haskell County file (StratMap 2026, FIPS 48207, vintage 2026-06-01)
- 9,836 records; 8,113 distinct `PROP_ID`; 786 account numbers repeated across 2,509 rows; up to 11 accounts on one shape.
- 626 records have no owner name. Coverage about 98.3% of the county; most gaps are road right-of-way strips.

Pitfalls
- Owner names are as the CAD typed them: "SMITH JOHN", "SMITH JOHN & MARY", "SMITH JOHN ETAL" are different strings. Suggest matches; never merge automatically.
- Addresses carry stray spaces (`PO BOX 6 , WEINERT`); tidy only for display.
- `LEGAL_AREA` is the CAD's figure; compare with calculated acreage and show both.
- Mineral interests are usually appraised separately and are not in the surface parcel layer.
- A county boundary project can need parcels from a neighbouring county (Stamford crosses into Jones County, not loaded yet).
