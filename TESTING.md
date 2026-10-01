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

OCR integration uses the real Tesseract.js 5.1.1 browser worker and trained English/Hindi data. `tests/image-ocr-regression.cjs` routes CDN assets to locally installed identical packages for deterministic network-independent verification; recognition is not mocked. Install `tesseract.js@5.1.1`, `@tesseract.js-data/eng`, `@tesseract.js-data/hin`, `@tesseract.js-data/ben`, and `@fontsource/noto-sans-devanagari` under `/tmp/studio-ocr`. Run with `STUDIO_OCR_LANGUAGE=hin` for the Hindi sample. It checks detection, click editing, a second OCR pass over newly drawn pixels, Delete, Undo/Redo, persistence, clean snapshots and no-text fallback.

## Browser object editing (2026-10-01)

The object editor regression uses real SlimSAM and the 62 MB quantized LaMa model. A real photo is segmented, inpainted and split into a draggable normal Studio layer. Save/reload, Undo/Redo, brush deletion and native file replacement are checked. Existing desktop header, source-image delete and real OCR regressions also passed. See OBJECT-EDIT-GUIDE.md for model fixture paths and runtime requirements. Public-site byte checks verify deployment; automated inference testing uses identical model/runtime assets through local routes.

### Object editor entry correction

The regression now opens a real JPEG through the template-library upload UI and clicks main Edit while a caption layer is selected. It verifies the object dialog opens, real SlimSAM/LaMa complete, replacement/drag/save work, and a background-only upload opens in one click without restoring the old background on reload. Desktop controls pass at 1024/1280/1440/1920 widths. Model hosts were checked with the public-site Origin header; they return permitted CORS headers. Browser live navigation in this workspace returns ERR_EMPTY_RESPONSE, so live publication is checked by deployment status and fetched file bytes, not claimed as a live-browser inference test.
