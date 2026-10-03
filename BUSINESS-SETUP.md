# APANAMai Studio: business controls

This setup applies only to cartoon-video-creation and Supabase project jruxafztuvenabqlzefz. ERP and marketplace are separate.

## Available now

- Membership page: authenticated, verified accounts may start one free pre-launch trial of exactly 15 days. Repeating the request does not extend it.
- Cashfree supports ₹10 Registration / 15-day trial and ₹100 Manual Studio / 30-day renewal. Production and sandbox entitlements are isolated. A previously used trial prevents repeat registration. Each payment requires an explicit checkout; no automatic debit is enabled. The manual editor currently remains open during launch preparation.
- Existing admin complimentary Manual Access remains available separately.
- Admin → Business / Reminders: store provider maximum per-unit cost in rupees, provider name and 25–75% margin. The estimate rounds up from `cost / (1 - margin)`. Include provider tax, exchange rate, processing and failed-generation allowance in the cost. This estimate does not buy credits or call a paid provider.
- Membership → Reminder preference: users can opt in/out of expiry emails. No marketing subscription is implied. SMS and automatic WhatsApp remain unavailable pending a provider and verified recipient numbers.
- Membership or editor → Cloud Files: upload/download/delete private JSON, PNG/JPG/WebP, MP3/WAV/OGG, browser-recorded WebM/M4A audio, MP4/WebM. Deletion first downloads a local backup when the stored file is ready.

## Storage limits

Limits are enforced by the server, not only by buttons:

| Limit | Value |
|---|---:|
| One file | 10 MiB |
| One account | 30 MiB / 30 files |
| Studio private-media pool | 150 MiB |
| Download allowance/account/day | 100 MiB / 20 requests |
| Download allowance/Studio/day | 500 MiB |

This pool is separate from existing public catalog assets and 2 MB project backups. Storage metadata is readable only by the owner. Clients cannot write stored sizes or upload directly into the private bucket. Downloads pass an authenticated server route; there is no reusable public download URL. Failed/aborted transfers still consume the request allowance. A timed-out upload retains its reservation; wait ten minutes before cleanup. If cleanup fails, its reservation stays occupied. Do not upgrade hosting or disable limits without reviewing total provider usage. These limits do not measure all platform bandwidth, database/WAL or other apps.

## Enable automatic Email when ready

1. In Brevo, create a transactional **API key** and verify the sender email/domain. The SMTP password previously used for Supabase Auth is not the same as this API key.
2. Open Supabase → Edge Functions → Secrets for the Studio project. Add:
   - `BREVO_API_KEY`: Brevo transactional API key.
   - `STUDIO_REMINDER_FROM`: verified sender email address.
3. The scheduler credential is generated privately in Vault by `studio-payment-alert-auth.sql`. Both delivery routes validate it server-side. No manual credential copying is required. Never put secrets in GitHub, HTML or user profiles.
4. Log in as the authorized Studio admin. Open Business / Reminders → Refresh. Check the provider status, then enable automatic Email and save. Default daily limit is 30 requests; the permitted maximum is 100. Check Brevo's actual remaining account quota, including login/verification emails, before enabling.
5. The hourly preparation job runs at minute 30 UTC; delivery runs at minute 45 UTC. Only opted-in verified members at the 7/3/1/0-day stages are queued. Repeated scheduler runs do not create the same notice again. Revoked, renewed or opted-out notices are skipped.
6. Check both the queue and Brevo delivery logs. `sent` means provider acceptance, not inbox delivery. Failed and uncertain results are not automatically retried, to prevent duplicates. An uncertain result needs provider-log review.

Without the provider keys and private scheduler authentication, scheduled sending does nothing. Admin payment email delivery has been verified separately with a confirmed live payment. Expiry emails are sent only for opted-in users whose effective entitlement ends in 7/3/1/0 days; a successful payment alert does not opt a user into expiry emails.

## Paid AI and SMS dependencies

Paid image/audio/video generation needs a selected provider, its secret key, an actual price quote and a verified prepaid balance/charging arrangement. Generation remains server-disabled until the paid AI provider and spending arrangement are configured. Professional output quality must be checked on real samples before activation. No unlimited paid generation or automatic recharge is enabled.

Automatic SMS needs its own provider, recipient consent/verification, sender registration and an agreed per-message cost limit. A mobile/WhatsApp number typed into a profile is not verified. Do not enable chargeable SMS on that basis. Manual WhatsApp reminder drafts remain available in Users / Profiles.

## Phone verification still required

On a real Android/iPhone, open the public app. Upload a camera photo → Area edit → Freehand, then move one finger around the desired shape. A second finger must not change the selection. Zoom, choose Brush to add and Erase to remove small parts, Undo an accidental selection, then Separate. Check the result and Save/Load. Test text in place, photo replacement, Cloud Files, offline saved projects, microphone permission and an exported video in your actual sharing app.

Automated Chromium tests emulate mobile dimensions and touch. They cannot prove physical-phone memory, keyboard, permissions, microphone or sharing compatibility. AI repair estimates missing background; it cannot recover the exact scene hidden behind an object.

## Validation

`tests/studio-business-rls-regression.sql` uses synthetic accounts inside a rolled-back transaction. It checks trial reuse, owner isolation, admin-only costs, margin rounding, consent, reminder deduplication, private file quotas and blocked paid activation. `tests/studio-business-edge-regression.cjs` mocks network responses to exercise the actual deployed handler without sending messages. Browser tests exercise user/admin screens, backup-before-delete, touch selection and genuine local OCR/AI downloads.

Provider references: https://developers.brevo.com/reference/send-transac-email and https://supabase.com/docs/guides/functions/schedule-functions

## Final acceptance before provider activation

- Phone: select/drag/resize/replace a photo; edit text; Save/Load; check a saved project offline. Record voice, stop, export a short video, play it with sound and share it using the actual phone app.
- Cross-device Cloud: with the same verified account, save a small sample poster/video and its audio on device A; open it on device B, compare text/photo/audio and download a local backup. Automatic tests and rolled-back server tests are complete; this real-account acceptance is still pending.
- Email: keep the transactional key and verified sender in Supabase Secrets. Scheduler authentication is generated privately as described above. Enable sending only after sender/provider checks; verify acceptance logs and actual delivery to a consenting test recipient separately. Never paste API keys in chat or public code.
- SMS and paid AI remain unavailable until their providers, verified recipients or price/credit arrangements, keys and actual output samples are configured. Estimates do not activate paid generation.
- Cashfree Live ₹100 checkout, server fulfilment and admin payment email delivery have been verified. ₹10 real checkout, actual bank settlement, physical-phone acceptance and real-account cross-device acceptance remain separate checks.
