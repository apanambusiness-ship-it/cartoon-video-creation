# Paid Shubh voice and ₹100 AutoPay

Implementation is deployed with live activation OFF. Do not describe live billing as available before an actual merchant sandbox test and a controlled live payment have succeeded.

## Prices and consent

- Registration stays ₹10; only successful production registration grants the initial 15-day trial. Existing valid dates are preserved.
- Manual membership stays ₹100 for 30 days. The additional AutoPay mandate is ₹100 every 30 days and requires explicit, unchecked customer consent. A calendar month is not promised.
- Paid Shubh is ₹1 per started 100 Unicode characters **per scene**, maximum 220 characters per scene, up to five selected scenes per operation. Its private price configuration uses a 70-paise budget ceiling with the existing 30% margin; this is not a promise of net profit.
- Published Sarvam Bulbul v3 tariff: ₹30 / 10,000 characters, checked 2026-10-05. Invoice, tax and payment fees still need reconciliation. Voice jobs therefore leave actual provider cost and profit NULL; the Admin summary identifies unreconciled jobs.
- Text is sent to Sarvam after consent. Supported languages are Hindi, Bengali, Gujarati, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu and Indian English. The system speaks existing text; it does not translate.
- AutoPay authorisation requests ₹1 with automatic refund instructed to Cashfree. Authorization alone grants no membership. Only independently verified INR100 CHARGE/SUCCESS payments grant 30 days. Cashfree's refund and bank settlement must be verified in a real checkout.

## Server deployment

Schema records: `studio-paid-voice.sql`, `studio-subscriptions.sql`. Edge functions: `studio-paid-voice`, `studio-subscriptions`. Both authenticate the user through Supabase Auth; subscription webhooks additionally verify HMAC on the raw timestamp/body and then fetch Cashfree subscription/payment details independently. No private key belongs in browser code.

Voice jobs bind account + request UUID + exact text/model/language digest atomically before making one provider request. A retry retrieves the existing private WAV, or reports the existing processing/failed/uncertain state. Ready audio remains retrievable when new paid requests are disabled. Confirmed failures release the reserve. Invalid or longer-than-14.7-second WAV output is rejected and releases the user reserve. Timeouts or ambiguous outcomes retain the reserve for operator reconciliation; they never trigger another automatic paid call. A confirmed failed scene can explicitly start a new attempt; previous successful scene IDs remain intact.

AutoPay uses PERIODIC/DAY/30 with a ₹100 maximum and 120 cycles. First charge is no earlier than the current trial/manual/paid access expiry or three days after setup. Cashfree may adjust `next_schedule_date` if authorisation is delayed; refresh the mandate in its dashboard for the final date. A single open mandate is allowed per account/environment. Stable create and cancel idempotency keys are distinct. Expired or cancelled mandates may be replaced. Cancellation and payment confirmation work even with new checkout creation disabled; cancellation preserves existing paid validity. An already pending debit must be reconciled in Cashfree.

## Activation prerequisites (not performed automatically)

1. Merchant Cashfree Subscriptions/UPI AutoPay must be approved and the GitHub Pages domain allowed. Add TEST credentials in Edge Secrets: `CASHFREE_TEST_APP_ID`, `CASHFREE_TEST_SECRET_KEY`; keep `STUDIO_PAYMENT_MODE=sandbox`. The subscription webhook secret can be supplied as `CASHFREE_TEST_SUBS_WEBHOOK_SECRET` (otherwise merchant secret is used).
2. Configure subscription webhooks in Cashfree to `https://jruxafztuvenabqlzefz.supabase.co/functions/v1/studio-subscriptions?action=webhook`; include status, successful/failed payment, cancellation and refund notifications. Pin API/webhook version 2025-01-01. A refund event triggers independent reconciliation, not an automatic extra credit. Membership refund/revocation handling still requires an operator decision; no automatic refund is promised.
3. With `STUDIO_SUBSCRIPTIONS_ENABLED=true` in sandbox, test mandate creation, ₹1 AUTH refund, first ₹100 debit, webhook duplicate delivery, cancel, bank-side cancellation, account switch and failed debit. Sandbox validity never grants production access.
4. For voice use the existing `SARVAM_API_KEY`. Set `STUDIO_PAID_VOICE_MODE=sandbox` and `STUDIO_PAID_VOICE_ENABLED=true` only for a verified Admin test account. A service-verified sandbox balance is required; customer sandbox accounts cannot use real provider credits. Public top-ups remain gated by the existing AI payment activation. Test a small controlled real provider generation and reconcile Sarvam credits/invoice before production.
5. Before production, review existing `CHECK(not payments_enabled)` / `CHECK(not ai_enabled)` in business settings. Their replacement needs a reviewed activation migration; this change deliberately does not remove them. Set production Cashfree keys, webhook configuration and enable server/database gates together only after merchant approval and end-to-end tests. Paid voice additionally requires `studio_private.paid_voice_config.enabled=true`; never expose a browser toggle for it. No live flag was enabled by this implementation.

## Verification completed

`tests/paid-integrations-edge.cjs` mocks providers and verifies Auth, quote budgets, text binding, duplicate suppression, failure/uncertain handling, subscription consent, server prices, AUTH exclusion, provider mismatch, fake webhook rejection, account ownership and cancel while disabled.

`tests/paid-integrations-rls.sql` runs on the real schema inside ROLLBACK with synthetic accounts. It verifies balances, refunds, duplicate payments/cycles, sandbox isolation and private privileges without changing real customer balances.

`tests/paid-integrations-browser.cjs` checks paid quote/consent, selected five of 35 scenes, old audio preservation, language invalidation, SDK mandate checkout, cancel controls and account reset. GitHub Actions also reruns existing audible full-length video and mobile checks. These mocked tests are not a real Cashfree or Sarvam transaction.

Official references:
- https://docs.sarvam.ai/api/getting-started/pricing
- https://docs.sarvam.ai/api/getting-started/commercial-licensing
- https://www.cashfree.com/docs/payments/subscription/hosted-checkout
- https://www.cashfree.com/docs/payments/subscription/create
- https://www.cashfree.com/docs/api-reference/payments/latest/subscription/webhook-signature

## संयुक्त Registration flow
नई Registration में unchecked consent: ₹10 registration, payment सत्यापन से 15 दिन, फिर ₹100 हर 30 दिन। `studio-registration-autopay.sql` को मौजूदा payment/subscription schema के बाद लागू करें। पहली checkout ₹10 order है; सफल return या refresh पर उसी account का server record मिलने के बाद बटन AutoPay completion में बदलता है। दूसरा चरण Cashfree bank mandate है (₹1 refundable authorization निर्देश)। Interrupted flow में registration दोबारा नहीं बिकता। Consent का version और समय private order पर रहते हैं। Subscriptions बंद हों तो नई registration भी बंद है।
पहली debit वर्तमान trial/access expiry से पहले नहीं है; setup बहुत देर से पूरा होने पर तीन दिन की तैयारी के कारण दिखाई गई debit तारीख आगे हो सकती है। Bank mandate confirm हुए बिना automatic debit चालू नहीं है। User नीचे AutoPay cancel कर सकता है; paid access नहीं मिटता। उत्पादन activation अभी बंद है; Cashfree ticket 8529363 का acknowledgment activation नहीं है।
