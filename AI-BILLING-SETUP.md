# AI billing status and activation

Membership remains ₹10 registration → first 15-day trial, followed by ₹100 per 30 days. Paid AI usage is separate. Existing valid trial and membership records are retained. `studio_start_trial` can read an existing trial, but cannot create an unpaid one.

The deployed `studio-ai-payments` Edge Function uses the existing Cashfree server credentials. Its `status`, `create`, `confirm`, and signed `webhook` actions operate on a separate AI service-credit ledger. `aic_` order IDs cannot fulfill `apn_` membership orders. ₹50/100/200/500 topups are validated server-side. Production and sandbox balances are isolated. Confirmation independently retrieves order and successful payment from Cashfree; SQL settlement is idempotent.

Checkout is closed unless **all** of `STUDIO_PAYMENTS_ENABLED`, `STUDIO_AI_TOPUPS_ENABLED`, and `STUDIO_PAID_AI_READY` are `true` and the selected environment credentials are present. Do not set AI readiness until an actual paid provider adapter, storage delivery, cost ceiling, cancellation/failure semantics and webhook reconciliation have passed tests. No paid video/poster provider is currently connected; real AI topups remain disabled.

Generation workers must verify Auth user identity and membership, use `studio_ai_job_reserve` with a stable request UUID and user-approved maximum price, and never accept an amount or provider identity as authority from the browser. The database quotes from admin rates. These worker RPCs are executable by service_role only. No browser-accessible endpoint currently reserves or generates paid jobs.

A successful worker stores and verifies output in the user's private storage namespace and calls `studio_ai_job_settle(...,'ready',actual_cost,owner/output_path)`. Definitive failure releases reserved funds back to app balance. Unknown/time-out provider outcome remains held as `uncertain`; never auto-release while a provider might still complete the job. Provider reconciliation is required before final settlement. This release is not a bank refund. Provider actual cost must fit the reserved estimate; otherwise review the job before settlement.

Admin AI figures show revenue, provider cost and **gross margin**, not net profit. Payment fees, tax and other expenses need separate reconciliation before reporting net profit. AI balance is service credit for this app, not a transferable payment instrument.

`tests/ai-billing-rls.sql` creates temporary synthetic identities and uses ROLLBACK; it does not change real user balances. `tests/ai-payments-edge.cjs` mocks all providers. `tests/ai-balance-browser.cjs` verifies UI account isolation and membership export checks. The manual editor's export gate is a browser UI/license check; it is not DRM against users who rewrite downloaded client code. Sensitive AI funds and provider access are enforced on the server.

`studio-ai-billing.sql` records the applied additive schema; do not re-run it wholesale over existing tables. Use a migration for later changes.

## Earlier Runway tariff configuration — retained, not launched (2026-10-04)

The earlier delegated selection configured the following Runway budget ceilings. These rows remain in the database, but generation and AI payments have not launched. The owner subsequently chose low-cost local photo stories with Shubh narration; do not apply the Runway audio row to Sarvam or treat these values as the current public Shubh tariff:

| Ledger kind | Provider model | Billing unit | App price |
| --- | --- | --- | --- |
| poster | gen4_image_turbo | One generated background image | ₹5 |
| audio | eleven_multilingual_v2 | Each started block of 100 text characters | ₹5 |
| video | gen4_turbo | Each output second, image-to-video without generated audio | ₹10 |

Poster Hindi text stays editable in the local editor; this price buys the generated bitmap background, not editable text within that bitmap. Video does not include voice; voice is quoted separately. A 5-second video is ₹50 and a 10-second video is ₹100. A longer reel must show the combined price for all component jobs before any reservation. Do not silently retry billed generations.

Official reference: https://docs.dev.runwayml.com/guides/pricing/
As checked on 2026-10-04, credits cost $0.01. gen4_image_turbo costs 2 credits/image; gen4_turbo costs 5 credits/second; eleven_multilingual_v2 costs 1 credit/50 characters. Account access and output quality still require validation.

The existing 30% gross-margin formula is retained: sale = ceil(budget ceiling × 100 / 70), in paise. The configured ceilings are ₹3.50/image, ₹3.50/100-character block and ₹7/output second, producing exactly ₹5/₹5/₹10. These are conservative app cost allowances, NOT measured provider invoice costs or live FX rates. The provider worker must record actual invoiced/provider cost separately. FX, applicable taxes, payment fees and storage must be reconciled before reporting profit. Suspend the affected tariff if actual total costs exceed its allowance; never change a user's approved quote retroactively.

Registration ₹10, first trial 15 days and monthly membership ₹100 are unchanged. Selected rates do not activate payments or generation. No real balance is credited or charged by this configuration.

### Remaining activation prerequisites

1. The owner creates/signs in to their own Runway developer account and funds API credits. The official setup guide states a $10 minimum initial credit purchase: https://docs.dev.runwayml.com/guides/setup/
2. Store RUNWAYML_API_SECRET in Supabase Edge Function secrets for project jruxafztuvenabqlzefz; never in a public file, chat message or browser storage.
3. Implement and validate the authenticated asynchronous provider worker, private output storage, cost/duration/character validation, uncertain-job reconciliation and result retrieval against that account. The ledger and checkout functions alone do not perform generation.
4. Test real poster output, Hindi voice, video, account isolation, timeout recovery and duplicate requests. Keep STUDIO_PAID_AI_READY and topups disabled until this passes.

The API account/key is not available through the current connectors. Provider activation and end-to-end real generation are unfinished.

## Current verified position — 2026-10-06

- Database membership values: 1000 paise registration, 15 trial days, 10000 paise monthly. Business payment and AI enable flags are false.
- Admin Shubh pilot is a separate active Edge Function. Provider-credit use is separate from user AI Balance. A successful Admin pilot is not public paid-AI activation.
- Public Shubh still needs an approved Sarvam-specific tariff, authenticated quote/reserve/generate/result adapter, actual-cost accounting, uncertain reconciliation and private-output retention. Those parts are not implemented by the Admin pilot or this document.
- Existing membership checkout is a one-time Cashfree order. It does not create a subscription mandate. ₹100 AutoPay is not implemented or active; do not label manual checkout AutoPay.
- AutoPay implementation requires an enabled merchant subscription service, explicit customer mandate authorization, verified subscription webhooks, recurring-payment idempotency, cancellation and failed-renewal handling. Existing membership periods must remain valid when a mandate is cancelled.

Before production activation, run provider sandbox and one authorized real-account transaction end to end. No real charge, tariff replacement or production flag change was made during the 2026-10-06 verification.
