---
name: browser-check
description: Exercise a Landman Command feature in a real browser with Playwright at desktop and phone sizes, check for page errors, and look at screenshots. Use for any visible change before calling it done.
---
# Browser check

1. Start the app (`cloud-dev-environment`). Use seeded synthetic data or projects created through the API for the check; never a database holding the owner's data.
2. Write a short Playwright script in the scratchpad (not in the repo) based on [template.js](template.js). Playwright and Chromium are preinstalled in cloud sessions: `require('playwright')` works and `chromium.launch()` needs no options.
3. Run it at 1280 x 800 and at 390 x 844. Use a geolocation in Haskell County (33.192, -99.635) when GPS matters, and `timezoneId: 'America/Chicago'` when times are shown.
4. For each check, assert the real outcome (text, count, saved value through the API), not only that an element exists.
5. Record page errors (`pageerror`) and treat any as a failure.
6. Take screenshots and look at them (deviceScaleFactor 1 for your own checks, 2 for images the Product Owner will see).

Report: the list of checks with ok or FAIL, both sizes, page errors, and the screenshot paths.

Known quirks
- Dialogs (`window.confirm`) must be handled explicitly; queue accept or dismiss per step.
- On a phone-size viewport the parcel panel covers half the map; collapse it before tapping the map.
- The online basemap is blocked in cloud sessions; the plain fallback background is expected.
