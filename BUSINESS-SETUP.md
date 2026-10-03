# APANAMai Studio: business controls

This setup applies only to cartoon-video-creation and Supabase project jruxafztuvenabqlzefz. ERP and marketplace are separate.

## Available now

- Membership page: authenticated, verified accounts may start one free pre-launch trial of exactly 15 days. Repeating the request does not extend it.
- Registration ₹10 and Manual Studio ₹100/month remain proposed paid plans. No payment is collected, no paid entitlement is issued and the manual editor remains open while payments are unavailable.
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
   - `STUDIO_CRON_SECRET`: a random password of at least 32 characters, used only for the scheduler.
3. Open Supabase → Vault → Add secret. Name: `studio_reminder_cron_secret`. Value: exactly the same `STUDIO_CRON_SECRET`. Do not put these secrets in GitHub, public HTML, user profiles or this guide.
4. Log in as the authorized Studio admin. Open Business / Reminders → Refresh. Check the provider status, then enable automatic Email and save. Default daily limit is 30 requests; the permitted maximum is 100. Check Brevo's actual remaining account quota, including login/verification emails, before enabling.
5. The hourly preparation job runs at minute 30 UTC; delivery runs at minute 45 UTC. Only opted-in verified members at the 7/3/1/0-day stages are queued. Repeated scheduler runs do not create the same notice again. Revoked, renewed or opted-out notices are skipped.
6. Check both the queue and Brevo delivery logs. `sent` means provider acceptance, not inbox delivery. Failed and uncertain results are not automatically retried, to prevent duplicates. An uncertain result needs provider-log review.

Without these keys and the matching Vault secret, scheduled sending does nothing. No email or SMS was sent while implementing or testing this release.

## Paid AI and SMS dependencies

Paid image/audio/video generation needs a selected provider, its secret key, an actual price quote and a verified prepaid balance/charging arrangement. Generation remains server-disabled while the payment account is excluded. Professional output quality must be checked on real samples before activation. No unlimited paid generation or automatic recharge is enabled.

Automatic SMS needs its own provider, recipient consent/verification, sender registration and an agreed per-message cost limit. A mobile/WhatsApp number typed into a profile is not verified. Do not enable chargeable SMS on that basis. Manual WhatsApp reminder drafts remain available in Users / Profiles.

## Phone verification still required

On a real Android/iPhone, open the public app. Upload a camera photo → Area edit → Freehand, then move one finger around the desired shape. A second finger must not change the selection. Zoom, choose Brush to add and Erase to remove small parts, Undo an accidental selection, then Separate. Check the result and Save/Load. Test text in place, photo replacement, Cloud Files, offline saved projects, microphone permission and an exported video in your actual sharing app.

Automated Chromium tests emulate mobile dimensions and touch. They cannot prove physical-phone memory, keyboard, permissions, microphone or sharing compatibility. AI repair estimates missing background; it cannot recover the exact scene hidden behind an object.

## Validation

`tests/studio-business-rls-regression.sql` uses synthetic accounts inside a rolled-back transaction. It checks trial reuse, owner isolation, admin-only costs, margin rounding, consent, reminder deduplication, private file quotas and blocked paid activation. `tests/studio-business-edge-regression.cjs` mocks network responses to exercise the actual deployed handler without sending messages. Browser tests exercise user/admin screens, backup-before-delete, touch selection and genuine local OCR/AI downloads.

Provider references: https://developers.brevo.com/reference/send-transac-email and https://supabase.com/docs/guides/functions/schedule-functions
