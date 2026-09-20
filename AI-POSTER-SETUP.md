# Free Workers AI poster setup

The manual poster editor remains available. This is a separate AI API and does not replace the existing `apanam-ai-creative-studio` Worker.

1. In the Cloudflare account `apanambusiness`, create a D1 database named `apanam-ai-quota` and run `ai-poster-schema.sql` against it.
2. Deploy `ai-poster-worker.js` as a separate Worker named `apanam-ai-poster-api` (do not overwrite the existing studio Worker).
3. Add a Workers AI binding named `AI` and a D1 binding named `DB` pointing to `apanam-ai-quota`. If using Wrangler, copy `ai-poster-wrangler.example.jsonc` to `wrangler.jsonc`, fill in the D1 database ID, then deploy. No payment method or paid plan is required for this trial.
4. Visit `https://apanam-ai-poster-api.apanambusiness.workers.dev/health` and confirm `{"ready":true}`. The editor will then reveal the AI button in Templates automatically.
5. Try product name and price in the editor. The AI generates copy, colors and selects a template; the poster remains editable. Its quota is shared by the Cloudflare account, not assigned per email user.

The Worker caps requests at 80 total and 3 per IP per UTC day using D1 counters. This is an early trial safety limit, not a neuron meter. Workers AI enforces the account's own daily free allocation. Never create an email-login paywall or collect payments without a verified server-side authentication and payment flow.
