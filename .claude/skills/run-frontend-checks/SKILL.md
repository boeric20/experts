---
name: run-frontend-checks
description: Run the Landman Command frontend checks - TypeScript typecheck, unit tests, and production build - and report real results. Use after any frontend change.
---
# Frontend checks

```bash
cd frontend && npx tsc --noEmit && npm test && npm run build
```
- `npm test` runs `node --import tsx --test src/lib/*.test.ts`. Pure logic belongs in `src/lib/` with a `*.test.ts` beside it.
- The build catches server/client boundary mistakes and hydration-unsafe code that the typecheck does not.
- Report each step's result separately. If the build fails, paste the first error.
- Visible changes also need `browser-check`.
