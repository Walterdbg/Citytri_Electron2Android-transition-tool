# Citytri Electron2Android Transition Tool

Research/scaffold project for evaluating whether the Citytri Shipment
Tracker's tablet/mobile UI work (originally built inside
`05-SHIPPING/renderer/index.html`) can become a real Android (and iOS) app
via a web-wrapper approach (Capacitor / Cordova / Tauri-mobile), separate
from the Electron desktop app.

## Why this is a separate project

The Shipment Tracker is Electron-only and cannot run on a real tablet or
phone (Electron only packages Windows/Mac/Linux desktop). The tablet/mobile
responsive UI redesign done inside that app's renderer can only ever be
viewed via a resized desktop browser window or an artifact preview — never
on an actual device. See `docs/Claude_Tablet_Mobile_UI_Protocol.md` for the
original UI spec that work was based on.

This project exists to explore, separately and without touching the frozen
Shipment Tracker codebase, whether that frontend work is reusable as the
basis for a real mobile app via a Capacitor/Cordova-style wrapper.

## Known architectural gap (read before doing further UI work here)

Capacitor/Cordova wrap a web frontend (HTML/CSS/JS) in a native shell —
they do **not** give it Node.js/Electron main-process access. The Shipment
Tracker's renderer talks to `window.shipAPI`, which is backed by Electron
IPC calling into Node `fs.readFileSync`/`writeFileSync` against a
user-picked folder ("library root"), PowerShell-driven Outlook COM
automation for email, and native OS file dialogs. None of that exists on
Android/iOS:

- No arbitrary folder access — mobile sandboxes apps to their own private
  storage (Capacitor's `Filesystem` plugin is not a drop-in replacement).
- No PowerShell/COM/Outlook-desktop automation — a mobile app would need a
  real API (e.g. Microsoft Graph) or share-sheet integration instead.

**Conclusion so far:** the UI/frontend layer (`reference/renderer/index.html`)
is potentially reusable as-is or with light changes. The data-persistence
and email-integration layer is not — it needs a mobile-appropriate backend,
which is a real design/implementation effort in its own right, not a
side effect of adding a Capacitor wrapper.

## Published preview artifact

**https://claude.ai/artifact/3PuGyF8KarjuWCZJwDwVh5** — "Citytri
Electron2Android — Mobile Preview," built from `renderer/index.html` +
`artifact/fixture.json` via `scripts/build-artifact.js` (includes a
viewport-size toolbar for testing tablet/phone breakpoints).

To update it after further changes here: rebuild
(`node scripts/build-artifact.js`), then republish passing this exact URL
as `url` — publishing without it creates a separate, disconnected artifact
instead of updating this one.

## Contents

- `renderer/index.html` / `reference/renderer/index.html` — snapshot of the
  Shipment Tracker renderer as it stood on 2026-09-17, including the
  tablet/mobile responsive CSS/JS. Not wired to any backend — for reference
  only. (Both copies are identical; `renderer/index.html` is the one the
  build script reads.)
- `docs/Claude_Tablet_Mobile_UI_Protocol.md` — the original tablet/mobile
  UI spec this work was built from.
- `artifact/fixture.json`, `scripts/build-artifact.js` — the synthetic-data
  fixture and build script that produce the published preview above.

## Status

Preview artifact exists and is reproducible from this repo. No
Capacitor/Cordova/Tauri project has been scaffolded yet — that real
mobile-wrapper implementation, and the backend rewrite it requires, are
still pending a decision on whether to proceed.
