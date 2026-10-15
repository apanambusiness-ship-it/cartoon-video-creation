# APANAMai Studio

Browser poster and cartoon video editor, with private Supabase account backups and Cashfree membership checkout.

**[Studio खोलें](https://apanambusiness-ship-it.github.io/cartoon-video-creation/) · [इस्तेमाल का तरीका](APP-USER-GUIDE.md) · [कोड का नक्शा](docs/PROJECT-MAP.md)**

## कहाँ क्या मिलेगा

| काम | पेज / मार्गदर्शिका |
| --- | --- |
| Poster, photo, text और product design | [index.html](index.html); [poster-editor.html](poster-editor.html) दूसरा editor entry point है |
| Cartoon, scenes, voice और video | [cartoon-video.html](cartoon-video.html) |
| अपना account, membership, payments और receipts | [membership.html](membership.html) |
| अधिकृत admin के संचालन | [admin.html](admin.html), [ADMIN-GUIDE.md](ADMIN-GUIDE.md) |
| Business व्यवस्था | [BUSINESS-SETUP.md](BUSINESS-SETUP.md) |
| Backup और recovery | [PRIVATE-BACKUP-GUIDE.html](PRIVATE-BACKUP-GUIDE.html), [GOOGLE-DRIVE-BACKUP-SETUP.md](GOOGLE-DRIVE-BACKUP-SETUP.md) |
| किस फाइल में बदलाव करें | [docs/PROJECT-MAP.md](docs/PROJECT-MAP.md) |
| Automatic और manual जाँच | [TESTING.md](TESTING.md), [GitHub Actions](https://github.com/apanambusiness-ship-it/cartoon-video-creation/actions) |

Editor में category चुनें या **Tools खोजें** में `फोटो`, `फ़ॉन्ट`, `रंग`, `कीमत` जैसे शब्द लिखें। मोबाइल पर ☰ **सभी Tools** में यही खोज उपलब्ध है। **खोज हटाएँ** से पिछली category वापस खुलती है।

## Development

The public frontend is static HTML/CSS/JavaScript; it does not need a framework build. Keep the current relative asset paths and script order. Shared editor changes must work in both poster entry points. The source map lists frontend, backend, Android and maintenance files separately.

Quick checks without installing a browser:

```sh
node tests/tool-search-regression.cjs
node tests/service-worker-core-regression.cjs
```

Browser checks run in the existing **Studio quality checks** GitHub workflow. See [TESTING.md](TESTING.md) for local prerequisites and the distinction between mocked integration checks and real service acceptance.

## Service status

Production payment fulfilment and admin payment email are verified. Consent-based expiry reminders are enabled with a daily cap. Sandbox never grants real validity. Manual editor currently remains open. Receipts confirm payment and are not tax invoices; refund requests require merchant review.

Paid AI providers, credits/charging, larger storage and physical-phone/cross-device acceptance remain separate setup or verification tasks. No provider secrets belong in this repository. ERP and marketplace are separate projects.
