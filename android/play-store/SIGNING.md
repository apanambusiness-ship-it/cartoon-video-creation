# Signed review bundle setup

This prepares an owner-signed review AAB; it does not upload to Play, enable billing or remove launch blockers. The Android product is still browser-backed. Release review builds use the `APANAMai Studio` label and open the configured Studio URL on first launch; debug builds retain the Test 2 label. The Custom Tab toolbar and Play billing blockers remain, so the review AAB is not a public release.

## Owner-controlled signing
Use your existing upload key, if one exists. Otherwise create and securely retain an upload keystore outside this public repository, following Android's app-signing guide. Never put the keystore or passwords in source files.

GitHub repository → Settings → Secrets and variables → Actions → New repository secret:

| Name | Value |
| --- | --- |
| STUDIO_UPLOAD_KEYSTORE_BASE64 | Base64 contents of your private upload keystore |
| STUDIO_UPLOAD_STORE_PASSWORD | Keystore password |
| STUDIO_UPLOAD_KEY_ALIAS | Upload key alias |
| STUDIO_UPLOAD_KEY_PASSWORD | Upload key password |

These are separate from Supabase, login and backup encryption passwords.

Actions → Studio Play signed review bundle → Run workflow:
- application_id: your final permanent Android package ID (not in.apanam.studio.test2).
- version_code: a positive integer, increasing with each submitted version.
- version_name: user-visible release version, for example 1.0.0.
- studio_url: the exact HTTPS Studio site URL, ending in `/`. The existing GitHub Pages URL remains a review default; choosing a different URL requires that site to be deployed and tested first. This input does not establish Digital Asset Links or Play billing compliance.

The workflow fails when signing secrets are missing. It generates no key, prints no credentials, stores no private key in artifacts and removes its temporary key file. A successful run provides APANAMai-SIGNED-REVIEW-NOT-UPLOADED for seven days. Save the reviewed AAB privately.

## Before Play upload
Resolve the browser-wrapper product/branding and Android payment-policy design, test the signed candidate on a real phone, complete account deletion rehearsal and verify backup/restore. Fill Console declarations from the actual release. Prepare authentic phone screenshots. Follow android/PLAY-RELEASE-PREP.md for the full readiness checklist.

Official guide: https://developer.android.com/studio/publish/app-signing
