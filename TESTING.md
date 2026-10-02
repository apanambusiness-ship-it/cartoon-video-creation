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

### Visible object actions

The object editor now fits the photo preview between its controls and footer. Regression checks verify photo, Separate/Drag, Delete, Replace and Close all remain onscreen without scrolling at 1280×620, 1024×600 and 390×700. The real-model separation/drag and persistence checks remain in the same regression.

The optional STUDIO_OBJECT_SCREENSHOT fixture was also run against the user-provided sports illustration screenshot: the shoe was segmented, inpainted, split into a layer and dragged. This verifies the visible screenshot content in a local browser; it does not prove inference in the user's live browser.

### Object-only PNG edits

A transparent variant of the user-provided sports illustration was tested with the real SlimSAM model, entering through the main Delete control. Extracting the shoe removed 16,485 object pixels and preserved all 367,864 unselected pixels exactly, including transparency and the other objects. Transparent sources default to AI fill off; optional AI repair is composited on the canvas background colour and cannot turn existing transparent pixels opaque. Main rectangle-style Delete/Replace entry points now open object selection; legacy explicit Advanced box-edit regression checks still pass.

### Direct object dragging

Real SlimSAM selection and direct drag inside the preview were verified on both the sports shoe and oil bottle visible in the user's screenshots. Releasing the mouse extracts/moves a new object layer and leaves the original photo position unchanged. The opaque photo path also runs actual LaMa repair. OCR recognition/edit/delete tests continue to pass, with hit boxes hidden until explicitly requested after reload.

Desktop object editor regression also checks that the selection canvas aligns with the original image on the main stage, while action controls remain on screen. Desktop editing uses a nonmodal side panel; mobile keeps a fitted preview.

Editable OCR layer tests use real Tesseract recognition, check stage-scale font bounds, undo/redo conversion, text editing, duplication, lock/hide/show/unlock and reload persistence. Source image edits and real SlimSAM/LaMa object dragging were rerun after these changes.

Drag regression verifies movement at the rendered stage zoom, prevents dragging locked photos and checks that one Undo restores the moved object position before the next Undo restores the original image. Image binding uses a WeakSet so restored layers get fresh handlers without clearing their lock state. Smart guides apply after movement.

Text-background regression checks all original white background pixels remain exactly unchanged during glyph conversion and uses real OCR on a gradient-backed sample to verify unsafe conversion is rejected atomically. English and Hindi recognition/edit/delete/conversion tests were rerun.

Desktop OCR regression asserts text controls belong to the Text sidebar and do not match :modal. OCR recognition now omits regions below confidence 65.

## Published-package audit — 2 October 2026

Downloaded the actual Pages artifact at commit 24b1857, checked all 216 JavaScript files with `node --check`, and ran account recovery, native touch and video format contract regressions. All passed. App script/style references exist; generated Jekyll guide URLs require the repository URL prefix when checking locally.

The editor loads `poster-editor-assets/touch-support.js`; its legacy-browser fallback now preserves native text inputs too. `node tests/mobile-native-input-regression.cjs poster-editor-assets/touch-support.js` verifies that loaded copy. `node tests/service-worker-core-regression.cjs` checks all 183 core URLs exist and auth POST/external cloud calls are excluded. The static core is about 1 MB. These checks do not replace real phone editing, real offline launch or actual MP4/audio playback verification.


## Private small video/audio cloud backups — 2026-10-02

Two private slots per authenticated account, 2 MB per complete JSON project. A private atomic counter limits this feature to 50 MB of logical JSON payload across all accounts; this is not a cap on total database, WAL, network traffic or other app features. No paid plan or automatic upgrade was activated.

Rollback-only database regression passed: owner-only access, anonymous denial, cross-user write/read/delete rejection, stale version update rejection, slot limit, budget overflow and required payload fields. Test users and rows were rolled back. Security review found no new advisories for these tables/trigger; existing guarded admin RPC and leaked-password warnings remain.

Browser regression passed at mobile width: inline login; scenes, main audio and per-scene audio Save/Load; size, conflict and full-quota errors; JSON download before deletion; local video preserved. REST responses in browser tests are simulated; a real user's cross-device login/download remains an operational check. Real Chromium WebM/MP4 files contain both video and audio streams; other devices/codecs are not guaranteed.

Account/profile now includes daily in-app expiring/expired business-membership notices. These do not send email/SMS or enable paid access restrictions. Provider setup, payment/paid AI generation and real-phone acceptance remain pending.



## Business / reminders / private media verification (2026-10-02)

- Trial is server-recorded once for verified users, exactly 15 days; current manual editor stays open during pre-launch. Payment remains disabled.
- Quotes round upward from maximum provider unit cost and margin; they do not debit a balance or call a paid provider.
- Consent-bound 7/3/1/0-day reminder queue includes the later applicable trial/complimentary expiry; renewed/revoked/opted-out notices are skipped. Unknown provider outcomes are not resent automatically.
- Private media limits: 10 MiB/file, 30 MiB and 30 files/user, 150 MiB pool. All downloads use a quota-controlled authenticated proxy (100 MiB / 20 requests per user per UTC day; 500 MiB pool/day). Aborted requests still consume quota.
- Database rollback test passed: trial reuse, owner isolation, admin-only prices, margin, consent, queue deduplication, media limits and disabled payment activation. No synthetic accounts persist.
- Actual Edge handler dry tests pass authentication, admin guard, MIME validation, ownership, no public signed download and timeout reservation retention.
- Automated UI tests cover user/admin pages, trial, consent, quote, upload, backup-before-delete, unavailable-provider guard and 390/1280px layouts with mocked backend responses. They are not a live cross-device account test.
- Natural-photo browser tests use a fixed OpenCV fruit camera sample, actual freehand/touch handlers, extra-finger cancellation, unchanged pixels outside the selection, saved extracted layer and real local LaMa repair.
- Physical-phone/microphone/sharing tests remain manual. Email delivery needs Brevo API key, verified sender and matching Edge/Vault cron secret. SMS and professional paid AI need external providers/keys and cost limits. No paid provider, payment collection or message delivery was activated in this release.
