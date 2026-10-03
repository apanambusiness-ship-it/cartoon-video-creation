# APANAMai Cashfree setup

Cashfree checkout preparation is deployed separately as `studio-payments`. Manual editing remains open during pre-launch. Paid AI stays disabled. No real charge is made by deployment.

## Enter keys securely

Open https://supabase.com/dashboard/project/jruxafztuvenabqlzefz/functions/secrets . Add each name and its value in Supabase, never chat or GitHub:

| Name | Value |
| --- | --- |
| CASHFREE_TEST_APP_ID | Cashfree **Test/Sandbox** App ID |
| CASHFREE_TEST_SECRET_KEY | Matching **Test/Sandbox** Secret Key |
| CASHFREE_LIVE_APP_ID | Cashfree **Live/Production** App ID |
| CASHFREE_LIVE_SECRET_KEY | Matching **Live/Production** Secret Key |
| STUDIO_PAYMENT_MODE | `sandbox` first |
| STUDIO_PAYMENTS_ENABLED | `true` to enable the selected environment; `false` to pause new checkout |

Missing keys or activation flag keeps checkout disabled. Never substitute live credentials for test credentials. Payment confirmation/webhook processing stays available when new checkout is paused.

## Webhooks and domain

In Cashfree Developers > Webhooks, configure the matching environment's payment-success webhook:

`https://jruxafztuvenabqlzefz.supabase.co/functions/v1/studio-payments?action=webhook`

The same endpoint is also supplied as each order's notify URL. Choose webhook API version `2025-01-01` and test delivery. The function verifies HMAC over the exact raw body, then independently checks Cashfree's order and successful payment APIs. JWT gateway verification is disabled **only** because this function implements user authentication itself and signature authentication for webhooks.

Production domain whitelist: `https://apanambusiness-ship-it.github.io`.

## Acceptance before live

1. Use a verified Studio account. Open membership.html and refresh Payment status. It must say Sandbox TEST.
2. Test Manual ₹100 checkout with Cashfree's documented test instruments. Check success, pending, failure/cancel, refresh, return URL and duplicate webhook delivery.
3. Verify Sandbox test expiry appears separately, production membership stays untouched, and repeat confirmation does not add another 30 days. Check real phone checkout and return.
4. Confirm KYC activation, your settlement bank and merchant pricing directly with Cashfree; the earlier Recharge Account display alone did not establish the settlement bank.
5. Only after sandbox acceptance, set `STUDIO_PAYMENT_MODE=production` and enable checkout. This causes real charges. Run an explicitly agreed live payment, verify provider transaction, membership expiry and settlement separately.

Registration ₹10 grants the original 15-day trial, never restarts an existing trial; users who already used the free trial must choose Manual renewal. Manual ₹100 adds 30 days to the existing paid expiry or starts now when expired. Complimentary access is recorded separately. There is no automatic debit or AI credit sale. Refund/dispute processing remains manual through Cashfree and requires corresponding access review; automated refunds are not included.

The private order ledger fixes prices on the server, reuses a pending checkout for 30 minutes and limits creation to 10 orders/account/day. SQL transaction locking prevents duplicate fulfilment. The user cannot write payment records or paid entitlements.

Official references: https://www.cashfree.com/docs/payments/online/web/redirect and https://www.cashfree.com/docs/payments/online/webhooks/signature-verification .
