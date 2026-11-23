---
name: delivery-report
description: Template for reporting finished work to the Landman Command Product Owner - what was built, files changed, real test results, open issues, how to try it, next steps. Use at the end of any implementation.
---
# Delivery report

Report only what actually happened. A check that was not run is listed as not run, with the reason.

```
## <feature or fix> is <done / partly done / blocked>

**What changed for you:** the visible result in plain words.

**Files changed:** grouped by area, with one line each.

**Checks:**
- Backend tests: <n passed, n failed> (command run)
- Frontend: typecheck, unit tests, build: <result>
- Browser: <what was exercised, at which sizes, page errors>
- Other (Docker build, data checks): <result or "not run: reason">

**Open issues:** anything known to be wrong or unfinished.

**How to try it:** steps on the owner's Mac (single-line commands, expected result), or where to click.

**Where it is saved:** branch and commit; whether `main` was updated.

**Next steps:** one to three recommendations, each with a one-line reason.
```

Rules: no em dashes, no praise, no claims beyond the evidence. Lead with the outcome.
