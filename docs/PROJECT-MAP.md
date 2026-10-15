# APANAM AI Studio — कोड और संचालन का नक्शा

यह repository Poster/Video Studio की है। APANAM Marketplace और ERP अलग projects हैं। UI, account और payment के files अलग पहचानें; किसी दूसरे project के credentials यहाँ न रखें।

## पेज

| फ़ाइल | काम |
| --- | --- |
| `index.html`, `poster-editor.html` | Poster editor के दो प्रवेश पेज; shared UI scripts और styles दोनों में जुड़े रहें |
| `cartoon-video.html` | Video, scenes, narration और export |
| `membership.html` | ग्राहक का account, membership, payment और सहायता |
| `admin.html` | अधिकृत admin workspace |
| `about.html`, `terms.html`, `privacy.html`, `refund-cancellation.html` | संपर्क और नीतियाँ |
| `delete-account.html` | Account deletion request |

## सही बदलाव के लिए सही फ़ाइल

| हिस्सा | मुख्य फ़ाइलें / directory |
| --- | --- |
| Canvas, saved projects, history, export menu | `poster-editor-assets/` में HTML द्वारा लोड की गई copies |
| Tools की categories और sidebar | `editor-organizer.js`, `editor-organizer.css` |
| हिंदी/English tool search के शब्द | `studio-tool-search.js`; sidebar और mobile menu इसी helper का इस्तेमाल करते हैं |
| Desktop canvas और layers | `studio-workspace.js`, `studio-workspace.css` |
| Mobile menu, sheets और editing shortcuts | `studio-mobile.js`, `studio-mobile.css`, `mobile-home-layout.css` |
| Header और interface readability | `header-responsive-fix.css`, `studio-navigation.css`, `studio-readability.css` |
| Templates और catalog | `studio-catalog-core.js`, `studio-library.js`, `studio-catalog.json`, `studio-original-templates.json` |
| Creative assets और ready posters | `studio-creative-library.js`, `studio-ready-posters.js`, `creative-assets/`, `festival-assets/`, `template-assets/` |
| Photo/object/text-region editing | `object-image-editor.js`, `image-content-editor.js`, `text-region-selector.js`; [object guide](../OBJECT-EDIT-GUIDE.md) |
| Video editor और workflow | `cartoon-video.js`, `video-*.js`, `video-simple-workspace.js` |
| Account/cloud client | `studio-cloud.js`, `account-profile.js`, `cloud-projects.js`, `video-cloud-projects.js` |
| Membership/payment interface | `membership.js`, `studio-business-ui.js`, `studio-payments-ui.js`, `account-payments.js` |
| Backend functions और database migrations | `supabase/`; backend changes are deployed separately from the static site |
| Install/offline support | `manifest.webmanifest`, `pwa-tools.js`, `service-worker.js` |
| Android wrapper | `android/`; [Android instructions](../android/README.md) |
| Maintenance, backup और asset generation | `scripts/`, `.github/workflows/` |
| Regression checks | `tests/`, [testing guide](../TESTING.md) |

कुछ पुराने root JavaScript files के नाम `poster-editor-assets/` की सक्रिय copies जैसे हैं। पहले HTML का `src` देखें; उसी लोड हो रही फ़ाइल में सुधार करें। Files को केवल सुंदर folder structure के लिए स्थानांतरित करने से मौजूदा URLs, relative imports और offline cache टूट सकते हैं।

## बदलाव का क्रम

1. Current `main` से branch बनाएँ और जिस पेज का व्यवहार बदलना है उसे पहचानें।
2. मूल control IDs और event handlers बनाए रखें। Canvas artwork पर UI styling लागू न करें।
3. Shared poster code बदलने पर दोनों HTML entry points देखें। नए scripts को उनके consumers से पहले जोड़ें।
4. बदले हुए asset की query version और service-worker cache version साथ बढ़ाएँ; नए offline assets को `CORE` में जोड़ें।
5. बदलाव से संबंधित checks चलाएँ। UI checks में desktop और mobile दोनों रखें; backend mocks को वास्तविक payment/login की जाँच न बताएं।
6. Pull request में बदलाव और जाँच का परिणाम दर्ज करें। `main` के static changes पर मौजूदा Pages workflow deploy करता है; deployment का सफल परिणाम देखें।

## उपयोगी मार्गदर्शिकाएँ

- [Studio इस्तेमाल करें](../APP-USER-GUIDE.md)
- [Admin संचालन](../ADMIN-GUIDE.md)
- [Business setup](../BUSINESS-SETUP.md)
- [Cashfree setup](../CASHFREE-SETUP.md)
- [Voice provider setup](../SARVAM-VOICE-SETUP.md)
- [Private backup](../PRIVATE-BACKUP-GUIDE.html)
- [Google Drive backup](../GOOGLE-DRIVE-BACKUP-SETUP.md)
- [Regression और acceptance checks](../TESTING.md)

यह map code की व्यवस्था बताता है। Provider, payment, backup schedule या production deployment की चालू स्थिति संबंधित service और latest workflow result से जाँचें।
