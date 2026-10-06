# APANAMai Studio — उपयोग guide


## नया भुगतान integration · 5 अक्टूबर 2026

Public Shubh के लिए ₹1 प्रति शुरू हुए 100 अक्षर प्रति scene का quote, सहमति और अलग AI balance ledger जोड़ दिया गया है। ₹100 हर 30 दिन AutoPay की अनुमति, स्थिति जाँच और बंद करने की सुविधा भी तैयार है। दोनों का live activation अभी बंद है; वास्तविक merchant checkout / provider जाँच बाकी है। पुराने Admin Shubh परीक्षण और manual membership सुरक्षित हैं। विस्तृत activation स्थिति: [Paid Shubh / AutoPay guide](PAID-VOICE-AUTOPAY-SETUP.md)।

## Membership और AI शुल्क

- पहली Registration ₹10: सफल Live payment की पुष्टि पर पहली बार 15 दिन की अवधि। पुराने वैध trial बने रहेंगे; अवधि दोबारा शुरू नहीं होगी।
- Monthly Manual plan ₹100 / 30 दिन: स्वयं renewal करें। Automatic debit नहीं है।
- Poster/video के manual editor और AI generation अलग हैं। Export के लिए सक्रिय trial, membership या अधिकृत admin access चाहिए। Draft और JSON backup सेव करते रहें।
- Paid AI poster, audio, video/cartoon/reel का शुल्क monthly plan में शामिल नहीं है। Provider और payment activation तक AI top-up तथा paid generation बंद हैं।
- AI Balance में उपलब्ध और reserve राशि अलग दिखाई जाएगी। सफल काम पर शुल्क कटेगा; failed काम की reserve राशि balance में लौटेगी। Unknown provider outcome में राशि reserve रहेगी, जाँच के बाद निपटारा होगा। यह bank refund से अलग है।
- Sandbox test में असली भुगतान/Live balance नहीं बदलता।

## Account और payment

Membership पेज में Email और Password से Login करें। नया Account बनाने के बाद Email verify करें। Password भूलने पर recovery विकल्प लें। Profile में नाम, संगठन, मोबाइल, WhatsApp और photo रखें। अपने खाते की अवधि और payment history यहीं दिखती है।

₹10 Registration या ₹100 Monthly plan चुनें, मोबाइल भरें और उपलब्ध होने पर Checkout खोलें। सफल payment के बाद स्थिति Refresh करें। Pending दिखने पर दूसरा payment भेजने से पहले आखिरी payment की स्थिति जाँचें। AI Balance checkout membership checkout से अलग है।

Receipt भुगतान की पुष्टि है, tax invoice नहीं। Help / Payment समस्या से order ID और तारीख के साथ सहायता माँगें; OTP/password साझा न करें।

## Poster और templates

1. Templates या Calendar खोलें। तारीख/अवसर चुनें, फिर उपलब्ध designs में से poster चुनें। पहले से काम खुला हो तो Save/backup लें।
2. Text चुनकर Text Edit खोलें। संस्था, नाम, तारीख और शुभकामना बदलें। छोटे Phonetic panel से भाषा, रंग और shadow बदलें; उसके शीर्ष भाग से panel खिसकाएँ।
3. Text को canvas पर drag करें। चुने box के कोने से आकार बदलें। Font size, alignment और line spacing से text व्यवस्थित करें।
4. Upload Image से अपना photo जोड़ें। Photo को चुनें, फिर Replace Selected Image से उसे बदलें। Fit पूरा photo दिखाता है; Fill frame भरता है और किनारे काट सकता है।
5. Elements में फूल, shapes, सजावट और राजनीतिक पार्टी category है। Element चुनें और जोड़ें। लोगो/photo अलग layer होता है; drag, resize, rotate और Delete कर सकते हैं। बसपा/SP के वर्तमान designs झंडे हैं।
6. Poster Size में Instagram, Story/Reel, WhatsApp, Facebook या YouTube format चुनें। Size बदलने के बाद किनारे और text की जाँच करें।
7. Layers में सही item चुनें। Duplicate कॉपी बनाता है; Lock अनचाहे drag रोकता है; Hide अस्थायी रूप से छिपाता है; आगे/पीछे layer का क्रम बदलता है। Delete चुना item हटाता है।
8. Undo पिछला बदलाव वापस लेता है; Redo उसे फिर लागू करता है।

Background editing में background layer और foreground/photo अलग चुनें। Object selection/cleanup में छोटे हिस्सों से शुरू करें और Undo उपलब्ध रखें। Local AI model पहली बार डाउनलोड होने में समय ले सकता है; server वाली paid AI generation उससे अलग है।

## Save, Load और download

- Save/JSON backup editable project रखता है। PNG/JPG एक तैयार तस्वीर है; उसमें text layers अलग नहीं रहतीं।
- Gallery में project नाम देकर सेव करें। Load/Gallery से दोबारा खोलें और बदलाव करें। दूसरे device पर JSON backup लाएँ।
- Cloud poster/video और Cloud Files के लिए Login चाहिए। वर्तमान file-size और slot सीमा app में देखें।
- PNG export में transparency रख सकते हैं। JPG transparency नहीं रखता। WebP छोटा file विकल्प है।
- Export से पहले product/image check, poster boundaries और spelling देखें। छोटे phone preview के साथ desktop preview भी देखें।
- Internet बंद होने पर उपलब्ध cached editor में saved drafts पर काम कर सकते हैं। Cloud, payment, नई model download और membership verification के लिए Internet चाहिए।

## Cartoon video / Reel

ऊपर Files, Share और विभागों की navigation है। Preview, Stop, Video, Save, पूरा Backup और Gallery सामने रहते हैं।

1. **Scenes** में कहानी / फोटो रखें। हर scene का Dialogue / Caption और समय देखें। समूह बार-बार जोड़ने से duplicate scenes बनेंगे; अपना काम पहले backup करें।
2. **आवाज़ → Shubh** में भाषा और Scene 1–5, 6–10 जैसे समूह चुनें। Text उसी भाषा में लिखें; automatic translation नहीं होती। पहली बार केवल एक समूह बनाकर Preview सुनें।
3. Credits वाला checkbox चुनें, फिर आवाज़ बनाएँ। यह अभी Admin pilot है: मालिक के Sarvam credits लगते हैं, user के AI Balance से शुल्क नहीं कटता। 220 अक्षर/scene और रोज़ 20 नए server jobs/Admin की सीमा है। 35 अलग scenes की नई आवाज़ एक दिन में पूरी नहीं होगी; तैयार requests फिर लेने पर नया provider call नहीं जाता। Failed/uncertain request का नया ID बनाकर बार-बार भुगतान न करें।
4. Text से हिंदी आवाज़ वाला दूसरा विकल्प मुफ्त basic eSpeak है; उसकी आवाज़ मशीन जैसी है। Dialogue सुनें/browser speech केवल text की जाँच है, उससे export audio नहीं बनती। अपनी audio file या microphone recording भी जोड़ सकते हैं।
5. ऊपर audio की स्थिति देखें: मुख्य audio और कितने scenes की अलग आवाज़ जुड़ी है। Preview में सुनें। केवल आखिरी 5 scenes की आवाज़ बनाई है तो पहले 30 अपने-आप Shubh में नहीं बदलेंगे।
6. **पूरा Backup (ऑडियो सहित)** लें। केवल सामान्य project backup में audio नहीं होती। Gallery का Save भी audio रखता है। पूरा backup की कुल audio सीमा 20 MB; Gallery और वर्तमान browser audio draft की सीमा 30 MB है।
7. **Video** दबाएँ। Recording के बीच scene बदलने से बचें और tab सामने रखें। 2 मिनट 48 सेकंड की कहानी को रिकॉर्ड होने में लगभग उतना समय लगेगा। MP4/WebM उपलब्धता browser के अनुसार है। तैयार download में “आवाज़ के साथ” देखें और डाउनलोड की फ़ाइल चलाकर जाँचें।
8. कहानी, आवाज़ या settings बदलने पर पिछला Video link हट जाएगा; नया Video बनाएँ।

नई व्यवस्था में वर्तमान कहानी की आवाज़ उसी browser में अपने-आप सेव होती है और उसी scenes वाले draft को refresh के बाद लौटती है। यह अलग device पर नहीं जाती; browser data साफ करने से हट सकती है। पहले से खोई आवाज़ केवल audio सहित backup/Gallery या उसी सुरक्षित Shubh request से वापस मिल सकती है। पूरा Backup हमेशा रखें।

यदि आवाज़ नहीं है: ऊपर audio count देखें → audio सहित backup/Gallery खोलें या चुने scenes की आवाज़ बनाएँ → Preview सुनें → नया Video बनाकर नई file डाउनलोड करें। पुरानी file को नया export न समझें। Microphone के लिए browser permission जरूरी है।

नया Scene जोड़ता है; Duplicate Scene कॉपी बनाता है; Scene हटाएँ चुना scene हटाता है। Design में आकार, रंग और transition बदलें; Download में format और timeline हैं। Phone पर sections बदलकर काम करें।

## Admin

- Users: खोज, status filter और page navigation से users देखें; Details से पूरा profile खोलें।
- Membership: वैध manual/business access की अवधि देखें और अधिकृत complimentary access दें/रद्द करें।
- Payments: Live और Sandbox अलग देखें; pending/paid orders तथा receipts जाँचें।
- Business / AI लागत: वास्तविक provider की प्रति-unit अधिकतम लागत और margin रखें। Cost खाली होने पर अनुमान तैयार नहीं होता।
- AI बिक्री और खर्च: सफल jobs की बिक्री, provider खर्च और gross margin अलग दिखते हैं। Gross margin में payment fees और अन्य operating खर्च घटाने बाकी हैं।
- Reminders: consent, provider readiness, daily limit और queue देखें। Failed/uncertain email को बिना जाँच दोबारा न भेजें।
- Templates/Calendar: draft में बदलाव, preview और publish प्रक्रिया इस्तेमाल करें। User के खुले project को बिना backup न बदलें।

## अंतिम वास्तविक-phone जाँच

उँगली से text/photo resize, Phonetic panel drag, microphone recording और video download असली Android/iPhone पर जाँचें। Browser emulation असली phone की अनुमति और hardware व्यवहार का प्रमाण नहीं है।



### सामान्य AI Chat
Account menu → 💬 AI Chat खोलें। Verified account से login और Sarvam को सवाल तथा हाल की बातचीत भेजने की स्पष्ट अनुमति जरूरी है। कहानी, पढ़ाई, लेखन, अनुवाद, सामान्य जानकारी और code पूछ सकते हैं। पिछले 3 सवाल-जवाब का सीमित संदर्भ जाता है; स्थायी chat history सेव नहीं होती। Clear और account बदलने पर संदर्भ मिटता है। अभी 10 सवाल/account/day और पूरे app में 50/day की included सीमा है; failed requests भी quota में गिने जाते हैं। Wallet से automatic कटौती नहीं होती। App सहायता shortcuts स्थानीय guide से चलते हैं। AI के पास live web, bank, ticket या account access नहीं है। Provider probe सफल होने पर ही server chat चालू करता है; Admin API Health में उसका sanitized result दिखता है।

AI Chat के जवाब पर 🔊 सुनें दबाकर browser/device की उपलब्ध आवाज़ सुनें; ■ रोकें से रोकें। Chat बंद करने, account बदलने या बातचीत साफ करने पर आवाज़ रुकती है। भाषा की voice device में न हो तो संदेश दिखेगा। आवाज़ की गुणवत्ता browser/device पर निर्भर है और कुछ voices को Internet चाहिए। App इस playback के लिए कोई नया paid AI request या wallet debit नहीं भेजता।
