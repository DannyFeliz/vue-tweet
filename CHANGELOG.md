# Changelog

All notable changes to this project are documented in this file.

## [3.0.0] - 2026-07-13

A hardening and modernization release. No breaking API changes — upgrading from 2.x is drop-in.

### Fixed

- Share links copied from X (e.g. `https://x.com/user/status/123?s=20`) were rejected as invalid because of the query string. The URL parser now handles query strings, fragments, and trailing paths.
- If Twitter's `widgets.js` fails to load (network error, blocker, firewall), the component now emits `tweet-load-error` and renders the `error` slot instead of showing the loading state forever. Script loading also has a 30s timeout.
- `isLoading` previously ended when tweet rendering *started*, so the `loading` slot could disappear before the tweet appeared. It now stays until the tweet is actually rendered.
- Invalid props (bad ID, bad URL, both provided) are validated *before* loading Twitter's script — errors surface immediately, with no network involved and no misleading console noise.

### Added

- The `error` slot now receives the error as a slot prop: `<template #error="{ error }">`.
- Exposed `reload()` method to re-run tweet rendering (e.g. from a "Retry" button).
- Typed emits — `@tweet-load-success` and `@tweet-load-error` handler payloads are now fully typed.
- New type exports: `TweetTheme` and `TweetWidgetTheme`.

### Changed

- SSR-safe: the component no longer touches `window` at setup time, so importing it in Nuxt/SSR apps doesn't crash (rendering remains client-side).
- Vue peer dependency relaxed from `^3.5.29` to `^3.3.0`.
- `sideEffects: false` declared for better tree-shaking.

### Internal

- E2E suite rebuilt around a hybrid strategy: deterministic network-blocked tests plus a live smoke set that verifies rendered embeds (theme incl. `system`, lang, cards, width, conversation, dnt).
- CI now type-checks and builds the library on every push, plus a weekly scheduled run of the live tests.
- Toolchain: Vite 8, TypeScript 6, vue-tsc 3.3, vite-plugin-dts 5, oxlint 1.73, Playwright 1.61.
- Removed a duplicate type-generation step from the publish flow.

## [2.4.0] - 2026-06

- Added `theme: 'system'` — automatically matches the user's OS color scheme and re-renders when it changes.

For older releases, see the [GitHub releases page](https://github.com/DannyFeliz/vue-tweet/releases).
