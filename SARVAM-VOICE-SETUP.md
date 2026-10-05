# Shubh Hindi voice — Admin pilot

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
