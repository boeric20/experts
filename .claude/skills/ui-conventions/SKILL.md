---
name: ui-conventions
description: Interface conventions for Landman Command - layout targets, CSS tokens and controls, unsaved-text protection, labelling of figures, truck mode, accessibility, and known browser quirks. Use when designing or building any screen.
---
# Interface conventions

Targets
- Laptop or desktop (check at 1280 x 800), phone (390 x 844), vehicle touchscreen (truck mode).
- Truck mode (`body.truck`): larger controls, notes read-only, no destructive actions, document-heavy layer groups hidden.

Styling
- Plain CSS in `frontend/src/app/globals.css`. Colours from `:root` variables (`--bg`, `--panel`, `--ink`, `--muted`, `--accent`).
- Controls: `.btn` (primary actions, `.btn.primary`), `.mini` (secondary), `.chip` / `.chip-on` (choices), `.switch` (on/off with `role="switch"`), `.mini.danger` (destructive).
- Scrollable panels over the map use background `rgba(16, 36, 47, 0.99)`. A fully opaque scroll container makes Chromium cull the map underneath.
- No UI framework or state library without the Product Owner's approval.

Behaviour
- Nothing typed is lost silently: explicit Save, visible state (not saved yet, saving, saved with time, not saved), a failed save keeps the text, and anything that would discard unsaved text asks first (`mayDiscard` in `page.tsx`; editors report `onDirtyChange`). Closing the tab with unsaved text warns.
- Destructive actions confirm and, where possible, offer Undo.
- Figures say where they come from: "calculated" or "county record". Never imply title or survey accuracy.
- Times: stored UTC, shown with the device's locale and time zone.
- Pages over the map use the URL hash (`#project=<id>&parcel=<id>`) so Back and reload work.

Accessibility
- Real buttons and labels; `aria-pressed`, `aria-expanded`, `aria-checked` where state is not obvious; visible focus; Escape closes pages and dialogs except while typing.

Structure
- Pure logic in `src/lib/` with tests; components small and named for what they show. `page.tsx` is already large: extract hooks or components rather than adding to it.
