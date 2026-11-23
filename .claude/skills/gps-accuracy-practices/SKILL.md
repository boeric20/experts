---
name: gps-accuracy-practices
description: GPS and positioning rules for Landman Command - browser geolocation behaviour, accuracy thresholds, secure-context requirement, parcel-match confidence, track recording, and field hardware. Use for anything involving the user's position.
---
# GPS and positioning

Browser geolocation
- Works only in a secure context: HTTPS, or `localhost` on the same device. A phone opening `http://192.168.x.x:3000` gets no location (see `docs/04-device-testing.md`).
- `watchPosition` with `enableHighAccuracy` follows the "High accuracy" toggle (`hooks/useGeolocation.ts`). Handle permission denied, unavailable, and timeout states with plain messages.
- `coords.accuracy` is a radius in metres at about 95% confidence. Show it; never claim better.

Thresholds (`lib/positioning.ts`)
- Default: excellent <= 1.0 m, usable <= 5.0 m, else poor.
- Truck mode: excellent <= 5.0 m, usable <= 20.0 m.
- Phone GPS is typically several metres; survey-grade accuracy needs an external GNSS receiver with corrections.

Parcel match
- `/locate` returns every record at the point with a confidence label. When the accuracy circle crosses a parcel line, the match is uncertain and the UI must say so.
- GPS updates must never replace a parcel panel that holds unsaved text.

Tracks
- Recording is foreground only; filters drop poor-accuracy fixes and jumps. Saving is idempotent by `client_uuid` (`/field/tracks`).

Field and vehicle
- Nothing that needs attention while driving. Heading Up depends on device heading, which is often missing when stationary.
- External receivers usually reach the browser through the operating system's location service; test with the actual device.
