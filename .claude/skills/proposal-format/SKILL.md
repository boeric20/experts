---
name: proposal-format
description: Template for a Landman Command development proposal that the Product Owner approves before work starts. Use when writing or reviewing a proposal for a feature, fix, or change.
---
# Development proposal

Write for the Product Owner, who is new to software. Plain words, no em dashes, short sections.

```
## Proposal: <short name>

**Objective:** what problem this solves for the user, in one or two sentences.

**Recommendation:** the solution in plain words. If there were real alternatives, one line each on why not.

**How it works:** the technical approach in a short list.

**What changes:** files and parts of the app likely affected; database changes and whether they touch saved data.

**Depends on:** new libraries, services, data sources, or decisions (with licence or terms checked).

**Risks and limits:** what could go wrong, what it will not do, effect on the owner's Mac and update process.

**Size:** S (under a day of agent work), M, or L, with the main driver.

**How we will test it:** automated tests, browser checks (sizes), data checks, and what the Product Owner can try.

**Decisions for you:** numbered questions that only the Product Owner can answer, each with a recommended answer.
```

Rules
- Never imply approval. End by asking for approval or changes.
- Anything that deletes or rewrites saved data, adds a dependency or outside service, changes Docker, ports, or the update process, or pushes to `main` must be listed under "What changes" and "Decisions for you".
