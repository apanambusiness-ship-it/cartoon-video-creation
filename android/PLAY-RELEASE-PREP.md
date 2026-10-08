# APANAMai Studio — Play release preparation
Prepared 8 October 2026. This is a preparation checklist, not a release approval.

## Current build
The current application ID is `in.apanam.studio.test2`; Java namespace is `in.apanam.studio`. Version 0.2-test (code 2) is a private test launcher. CI produces a debug APK and an unsigned release AAB. Neither is a finished Play release. The visible start screen opens the website in a Custom Tab or browser. A browser toolbar is expected; fullscreen TWA is not verified.

Before release the owner must confirm the permanent application ID, retain an owner-controlled upload key securely outside source, enrol in Play App Signing, configure signed release builds, and test the resulting artifact. Do not reuse an ephemeral CI debug key. Origin-root Digital Asset Links would need separate ownership work; the project subpath does not prove origin ownership.

## Work that can proceed now
- Review the listing draft below and prepare screenshots from the actual release on a phone.
- Run the device checklist and record phone model, Android/browser version, build, date and result.
- Review privacy/data flows and deletion handling against the Data Safety evidence table.
- Determine Play account type and the applicable testing requirements.
- Decide a compliant Android billing design before enabling paid checkout in a Play-distributed app.

Support blockers remain separate: Supabase ticket SU-499243 (no successful complete private backup yet), Cashfree activation review (no confirmed real AutoPay test), and paid AI activation/cost approval.

## Listing draft
App name: APANAMai Studio

Short description: Create editable posters, certificates, visiting cards and photo story videos.

Description:
APANAMai Studio helps you create posters, certificates, visiting cards and photo story videos. Choose a design, add your text and photos, and adjust the layout. Arrange photos into scenes, add captions and narration, preview your project and export using the available formats.

Save local drafts and download a complete project backup, including scene audio where present. Account features include private cloud files and membership information. Voice availability and export support depend on the device, browser and enabled services. This version opens Studio through a supporting browser.

APANAMai Studio is a brand of ROY INDUSTRIES.
Support: apanambusiness@gmail.com

Review this copy against the final release. Do not advertise paid AI generation, verified fullscreen mode, automatic renewal or universal language/voice support until actually enabled and tested. Current web pricing is ₹10 registration, a 15-day period, then ₹100 every 30 days with explicit AutoPay mandate consent. Android listing/pricing must match its final compliant billing design.

## Billing gate
Digital membership and paid AI functionality in a Play-distributed app generally require Google Play Billing unless an applicable policy exception or enrolled alternative billing programme applies. Cashfree merchant approval by itself does not establish Play compliance. Website checkout displayed through a launcher does not automatically create an exemption.

Choose and implement one eligible design:
1. Google Play Billing, with server verification, entitlement handling, restore, cancellations and refunds.
2. An eligible enrolled alternative billing programme, including required user choice, APIs and transaction reporting.
3. A consumption-only app, if eligible, with no disallowed purchase/signup routing.

Do not publish the current launcher with newly activated web payment routing until this decision is resolved. Keep the agreed web prices unchanged while evaluating Android billing.

Official references:
- https://support.google.com/googleplay/android-developer/answer/9858738
- https://support.google.com/googleplay/android-developer/answer/10281818
- https://developer.android.com/google/play/billing/billingchoice

## Data Safety evidence draft — owner review required
This table is an inventory, not completed Play Console answers. Include website and third-party flows used by the release; confirm collection, sharing, purposes, optionality, encryption and retention for each.

| Flow | Data/evidence | Review before submission |
| --- | --- | --- |
| Account/profile | Supabase login; name, email, optional phone, organisation, city, website, photo | Authentication, account management; required vs optional fields; deletion |
| Cloud files | User-selected project/media uploads to private account storage | Photos, audio, files; upload consent; retention and access rules |
| Local editing | Drafts/gallery/assets in browser storage | Distinguish local-only processing from cloud upload; device/browser storage loss |
| AI chat/voice | Consented questions, recent limited context and narration text may go to Sarvam | Provider processing/retention and Play sharing definitions; no permanent app transcript is not proof of no provider collection |
| AI suggestions | Product/category/brand information may go to configured Cloudflare Worker | Check actual provider routing and enabled feature flags |
| Voice typing | Phonetic microphone uses browser speech recognition after explicit confirmation; browser may send audio to its own service | Review audio processing/provider collection and microphone disclosure; app does not save a dictation recording; supported languages and online availability vary |
| Payments | Cashfree handles checkout; server stores orders, amounts, status and membership | Financial/payment data categories; final Android billing provider; cancellation |
| Diagnostics | Account ID, category, error code, timestamp; counters | Privacy page describes 30-day cleanup on subsequent reports/requests; verify enforcement |
| Reminder email | Verified email sent to configured provider with consent | Privacy page describes completed queue cleanup around 90 days; check enabled provider |

Privacy URL:
https://apanambusiness-ship-it.github.io/cartoon-video-creation/privacy.html

Deletion request URL:
https://apanambusiness-ship-it.github.io/cartoon-video-creation/delete-account.html

Test actual deletion on a disposable account: request → admin processing → remove eligible cloud/profile data → revoke sessions → verify access denied → document legally retained payment records and backup retention. A working request button alone does not prove deletion is complete. Check that privacy statements match the released system.

Official references:
- https://support.google.com/googleplay/android-developer/answer/10787469
- https://support.google.com/googleplay/android-developer/answer/13327111

## Real phone acceptance checklist
Use a disposable project/account. Preserve the working installed app and original files.
1. Open the test launcher and Studio; check back navigation, login and all main tabs.
2. Create a poster. Edit text with the phone keyboard/phonetic input; resize and move with touch and directional buttons. Check small-screen clipping and portrait/landscape.
3. Create a short three-scene photo story. Add narration. Preview every scene and confirm sound.
4. Export video; open the downloaded file in a separate phone player. Confirm image, voice, timing and end of clip. A preview alone is insufficient.
5. Share that file to a chosen app; verify recipient preview/file accessibility without sending it unintentionally.
6. Download complete backup with audio; restore into a fresh draft and confirm photos, captions, scene order and narration.
7. After visiting the editor online, disconnect the network. Reopen local draft and edit/save it. Confirm clear messages for unavailable cloud/AI operations. Reconnect and verify no duplicate work/charges.
8. Test poster download, permissions, failed network recovery and logout. Record any error text and the exact step.

Result record:
| Phone / Android / browser | Build/date | Scenario | Pass/fail | Evidence/problem |
| --- | --- | --- | --- | --- |
| To be filled | | | | |

Automated browser checks do not replace these real-device checks.

## Console and release gates
- Owner confirms developer account verification, app name/package and signing ownership.
- For personal accounts created after 13 November 2023, Google's current production-access process requires a closed test with at least 12 testers opted in continuously for 14 days; verify the Console requirements for this account.
- Prepare genuine phone screenshots, icon and other assets according to the current Console specifications.
- Complete content rating, target audience, app access for reviewers, ads declaration, privacy, Data Safety and deletion declarations using the actual release.
- Verify current target SDK requirements, signed bundle validation and pre-launch reports.
- Complete real billing and cancellation tests using the approved Android billing design.
- Obtain a complete encrypted database/media backup and demonstrate isolated restore before relying on disaster recovery.
- Keep paid AI off until provider credentials, unit costs, user charges and failure refunds are verified.
- Submit only after unresolved gates are cleared; no production upload has been performed by this checklist.

Testing reference:
https://support.google.com/googleplay/android-developer/answer/14151465


## Prepared store assets and owner-signed review workflow
See [listing text and assets](play-store/LISTING.md) and [signing setup](play-store/SIGNING.md). The manual `Studio Play signed review bundle` workflow requires owner-controlled signing secrets and final package/version inputs. It neither uploads to Play nor makes the current Test 2 launcher production-ready.
