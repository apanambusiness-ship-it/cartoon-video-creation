# Shubh Hindi voice — Admin pilot


## नया भुगतान integration · 5 अक्टूबर 2026

Public Shubh के लिए ₹1 प्रति शुरू हुए 100 अक्षर प्रति scene का quote, सहमति और अलग AI balance ledger जोड़ दिया गया है। ₹100 हर 30 दिन AutoPay की अनुमति, स्थिति जाँच और बंद करने की सुविधा भी तैयार है। दोनों का live activation अभी बंद है; वास्तविक merchant checkout / provider जाँच बाकी है। पुराने Admin Shubh परीक्षण और manual membership सुरक्षित हैं। विस्तृत activation स्थिति: [Paid Shubh / AutoPay guide](PAID-VOICE-AUTOPAY-SETUP.md)।

The selected Bulbul v3/Shubh sample was approved by the owner. The editor now offers a separate Shubh voice section. Basic local eSpeak remains available. Membership registration ₹10, first 15 days, monthly ₹100 and all existing AI tariff rows are unchanged.

`studio-sarvam-voice` authenticates the bearer token against Auth, requires verified email and a database Admin entry. It never accepts user IDs, provider URLs, voice names or prices from the client. This initial pilot consumes the owner's Sarvam account credits only; it neither charges nor credits a user AI wallet. Public customer generation and topups remain OFF.

## Activate the Admin pilot

In Supabase project `jruxafztuvenabqlzefz`, Edge Functions → Secrets, add:

- `SARVAM_API_KEY`: the key from the owner's Sarvam API account. Never paste into chat, commit to GitHub, or store in browser/local storage.
- `STUDIO_SARVAM_PILOT_ENABLED`: `true` after reviewing the provider credit cost.

No new key creation is necessary. These connectors cannot set secrets. Test the real account after secrets are saved, including Hindi pronunciation and exported video audio. Availability is shown through the authenticated status endpoint.

## Pilot safeguards and limitations

- At most 220 Unicode characters per scene, 5 scenes per browser batch, 20 new server jobs/Admin/day.
- Database claim is atomic; owner + UUID + input hash prevents duplicate calls. Result is stored privately and returned through the authenticated function. Same-request retries return stored output.
- A timeout, provider 5xx, malformed response or storage failure becomes uncertain; do not bill the provider again automatically. Admin must inspect outcome. A definitive 4xx is failed. Hashed-text request IDs are retained locally across restarts. Clearing browser data discards them; do not recreate uncertain jobs after clearing data.
- No customer access or direct storage policy. Server service role only. Result paths are tied to verified owner IDs.
- Scenes adjust to WAV duration; clips longer than 14.7 seconds are rejected in the editor without truncation. Earlier successful scene results remain reusable through their request IDs.
- This pilot does not perform phoneme alignment or animate mouths. Private pilot audio requires an explicit future retention/deletion policy before customer launch.

Customer activation still requires Sarvam pricing in the existing ledger, a user-approved full quote, balance reservation, verified delivery, failure/uncertain reconciliation, real generation testing and payment readiness. Do not turn `STUDIO_PAID_AI_READY` on because this pilot alone exists.

## Languages
Supported provider API languages: Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu and Indian English. The editor sends the selected code; the server enforces an allowlist. Text must already be in that language; this does not translate it. Language is included in both retry identity and server input hash. Existing Hindi retry IDs and hashes remain unchanged. Other languages can use uploaded/recorded narration. Actual pronunciation in each language requires owner review before customer launch.

## Editor/export completion — 2026-10-06

The owner confirmed the real Shubh voice sounds correct. Generation supports selected groups of up to 5 scenes inside a larger project and preserves other scene audio/photos. The 20-new-jobs/day server cap is unchanged. Current browser audio drafts are persisted in IndexedDB (30 MB cap); full backups remain necessary. Export starts sound and frame production immediately after MediaRecorder.start. Browser regression tests verify decoded audio signal after generation, refresh and actual export; provider mocks are used and are not evidence of real multilingual pronunciation or provider billing.

