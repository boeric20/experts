# Research notes (Ruth's working memory)

Durable lessons from past research jobs: where records live and how sources behave. No
personal data or client findings. Each entry is dated; re-check anything older than a few
months before relying on it. When you learn something new and durable, tell the user so it
can be added here.

## Pecos County (learned 2026-11-22)
- Appraisal district: https://www.pecoscad.org is live (Pritchard & Abbott platform). The
  Comptroller county directory's CAD entry is from 2013 but points to the right site.
- Certified appraisal roll CSVs for 2019 to 2026 are free on the CAD's Data Records page
  (about 32,000 rows per year). Filtering the CSV is more reliable than the CAD keyword
  search, which returned no rows for some strings, possibly a page-timing issue.
- CAD detail pages: `https://www.pecoscad.org/Home/Details?parcelId=<ID>`. Sales (deed
  history) and land segments come from `/Home/Sales` and `/Home/Lands`, keyed by ParcelId.
- CAD GIS (parcel shapes and attributes, no login):
  gisdata.pandai.com/pamaps02/.../Pecos/PecosCADPublic. Its "Stated Area" can differ a lot
  from CAD acres; report both, never reconcile.
- Minerals are appraised by Thos. Y. Pickett & Co., not shown on the CAD site; ask the CAD or
  the firm for mineral accounts.
- CAD deed history is a lead, not a citation. It can contain placeholder entries (no grantor,
  Vol 0 Pg 0) and impossible dates; confirm every reference at the clerk.
- County clerk: no official online search. `pecos.tx.publicsearch.us` does not exist (DNS
  failure). TexasFile is the online index and needs a login.
- Taxing units: the CAD listed Pecos Memorial Hospital District (unit 66) where the
  Comptroller's consolidated list shows Iraan General HD. Confirm who collects for each unit
  before reporting taxes.

## Statewide tools (learned 2026-11-22)
- Railroad Commission public map service `gis.rrc.texas.gov` rrc_public/RRC_Public_Viewer_Srvs
  can be queried without a login for wells, pipelines (T-4 permits), and surveys intersecting
  a tract. Wells near shared lines show up on more than one tract.
- Texas Comptroller franchise tax account status (entity status, SOS file number, registered
  agent, officers) is free and public. SOSDirect filings cost a fee per search.
- PUC Interchange docket filings (https://interchange.puc.texas.gov) can list landowners
  directly affected by a transmission line; check the docket status before relying on it.
