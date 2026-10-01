# Browser regression checks

Install Playwright in your development environment and its Chromium browser, then run:

```sh
node tests/browser-regression.cjs
```

If Chromium is already installed, set `STUDIO_CHROMIUM_PATH` to its executable path. The narrated export check also requires `ffprobe` and `ffmpeg` on PATH.

The suite serves the project locally with service workers blocked and checks:

- Poster/video pages at 320, 390, 768 and 1280 pixels, without horizontal page overflow.
- PNG, JPG, WebP and PDF poster downloads.
- Literal rendering of scene titles/captions, stale timing invalidation and quota failure rollback.
- IndexedDB version recovery and gallery restore after a reload.
- Atomic rejection of malformed multi-project gallery imports.
- Silent-video selection, thumbnail updates and complete JSON backups.
- WebM downloads, with a generated WAV verifying real audio and video streams.

A real phone should still check microphone permissions, audible playback and installation. Server-side AI, account login, cloud sync and paid services require their own configured systems.

## Admin and template library

Run `node tests/admin-regression.cjs` for admin batch upload, IndexedDB draft persistence, safe editable HTML, rename, editor round trip, catalog/settings download and user image upload. Public catalog updates still require a GitHub owner/maintainer commit; local admin drafts never modify the published JSON.

Template content regression: `STUDIO_CHROMIUM_PATH=/tmp/studio-chromium node tests/template-content-regression.cjs` verifies JSON text fields, flattened-image text/photo replacement regions and persistence after reload. `tests/header-regression.cjs` checks the single desktop action row and arrow scrolling at 1024–1920 px. Template-pack initialization preserves an occupied canvas.

`tests/template-delete-regression.cjs` checks actual image pixels for erase, direct text/photo edits, unchanged pixels outside the selection, no extra cover layer, Undo/Redo and persisted edits after reload.
