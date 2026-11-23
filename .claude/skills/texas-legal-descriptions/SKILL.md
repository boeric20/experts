---
name: texas-legal-descriptions
description: Reading Texas legal descriptions for Landman Command - original surveys and abstracts, railroad section-block surveys, metes and bounds, varas and Spanish units, acreage checks, and matching descriptions to mapped parcels. Use when parsing, comparing, or mapping legal descriptions.
---
# Texas legal descriptions

Texas does not use the federal township-and-range system. Land is described by reference to original surveys.

Survey references
- Original surveys are named for the original grantee or the entity granted the land, and carry an abstract number assigned within each county ("A-368 SCOTT JAMES SUR #118" in Haskell CAD style: abstract 368, the James Scott Survey, survey number 118). The same abstract number means different land in another county.
- Railroad and school land surveys in West Texas are commonly described by section and block (for example "Section 12, Block 3, H&TC RR Co Survey").
- Subdivisions: lot and block in a recorded plat, with the plat's recording reference.
- The GLO holds the original survey files and county abstract maps.

Metes and bounds
- A sequence of calls (bearing and distance) from a point of beginning, often tied to a survey corner. Check closure (does the last call return to the start) and compare calculated area with the called acreage.
- Units: 1 vara = 33 1/3 inches (2.7778 ft); 1 acre = about 5,645.4 square varas; 1 labor = about 177.1 acres; 1 league = about 4,428.4 acres. Confirm the unit stated in the instrument.

Matching to the map
- Appraisal shapes are approximations drawn by the CAD; they do not replace a survey.
- Match on county, abstract and survey, section and block, then acreage and shape. Report the match strength and every mismatch.
- Show called acreage and calculated acreage side by side; never reconcile them silently.
- Plotted calls are labelled "plotted from description, not surveyed".
