# AI billing status and activation

Membership remains ₹10 registration → first 15-day trial, followed by ₹100 per 30 days. Paid AI usage is separate. Existing valid trial and membership records are retained. `studio_start_trial` can read an existing trial, but cannot create an unpaid one.

The deployed `studio-ai-payments` Edge Function uses the existing Cashfree server credentials. Its `status`, `create`, `confirm`, and signed `webhook` actions operate on a separate AI service-credit ledger. `aic_` order IDs cannot fulfill `apn_` membership orders. ₹50/100/200/500 topups are validated server-side. Production and sandbox balances are isolated. Confirmation independently retrieves order and successful payment from Cashfree; SQL settlement is idempotent.

Checkout is closed unless **all** of `STUDIO_PAYMENTS_ENABLED`, `STUDIO_AI_TOPUPS_ENABLED`, and `STUDIO_PAID_AI_READY` are `true` and the selected environment credentials are present. Do not set AI readiness until an actual paid provider adapter, storage delivery, cost ceiling, cancellation/failure semantics and webhook reconciliation have passed tests. No paid video/poster provider is currently connected; real AI topups remain disabled.

Generation workers must verify Auth user identity and membership, use `studio_ai_job_reserve` with a stable request UUID and user-approved maximum price, and never accept an amount or provider identity as authority from the browser. The database quotes from admin rates. These worker RPCs are executable by service_role only. No browser-accessible endpoint currently reserves or generates paid jobs.

A successful worker stores and verifies output in the user's private storage namespace and calls `studio_ai_job_settle(...,'ready',actual_cost,owner/output_path)`. Definitive failure releases reserved funds back to app balance. Unknown/time-out provider outcome remains held as `uncertain`; never auto-release while a provider might still complete the job. Provider reconciliation is required before final settlement. This release is not a bank refund. Provider actual cost must fit the reserved estimate; otherwise review the job before settlement.

Admin AI figures show revenue, provider cost and **gross margin**, not net profit. Payment fees, tax and other expenses need separate reconciliation before reporting net profit. AI balance is service credit for this app, not a transferable payment instrument.

`tests/ai-billing-rls.sql` creates temporary synthetic identities and uses ROLLBACK; it does not change real user balances. `tests/ai-payments-edge.cjs` mocks all providers. `tests/ai-balance-browser.cjs` verifies UI account isolation and membership export checks. The manual editor's export gate is a browser UI/license check; it is not DRM against users who rewrite downloaded client code. Sensitive AI funds and provider access are enforced on the server.

`studio-ai-billing.sql` records the applied additive schema; do not re-run it wholesale over existing tables. Use a migration for later changes.
