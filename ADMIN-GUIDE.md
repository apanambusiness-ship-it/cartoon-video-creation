# APANAMai STUDIO — मुफ्त Admin और Template Guide

## कौन क्या कर सकता है

- Users: प्रकाशित templates खोलना, text/photo/logo बदलना, अपनी image या editable JSON upload करना, और export/backup डाउनलोड करना।
- Admin: `admin.html` में template जोड़ना, नाम/category बदलना, duplicate करना, hide/delete करना, editor में layers बदलना, app settings तैयार करना और catalog backup लेना।
- Live publication: Cloud Admin Login में verified owner account से login करें। Admin अधिकार database में अलग दिए जाते हैं; signup से admin अधिकार नहीं मिलते। Cloud draft Save निजी catalog रखता है और Publish केवल visible posters सार्वजनिक करता है। Access session उसी browser tab में रहती है; public configuration में केवल publishable key है।
- Software changes: admin workspace का “Software source / सभी files” लिंक खोलकर GitHub में code/features बदलें। प्रत्येक commit का इतिहास और deployment status उपलब्ध है।

## Poster / template जोड़ना

1. Admin Workspace → Posters / Templates → Category लिखें।
2. कई images या JSON files एक साथ चुनें। Draft IndexedDB में सेव होता है।
3. “Editor में बदलें” से poster खोलें। Photo, text और logo edit करें। ऊपर “Template बदलाव admin में सेव करें” दबाएँ।
4. Name/category बदलें। “User Library में दिखाएँ” हटाने पर template अगले publication के बाद छिपेगा।
5. पहले Catalog JSON backup डाउनलोड करें। अधिकृत admin Cloud draft Save या Publish दबाएँ। दूसरे device पर Login → Cloud draft खोलें। GitHub `studio-catalog.json` पुराना backup/fallback रास्ता भी उपलब्ध है।

JPG/PNG में पुराने text/photos अलग layers नहीं होते। Image एक layer के रूप में खुलती है; नई text/photo/logo layers जोड़ सकते हैं। पूरी तरह editable template के लिए editor का Save JSON इस्तेमाल करें।

Template संख्या पर कोई तय सीमा नहीं रखी गई है। Browser storage और hosting/file-size limits फिर भी लागू हैं। Search तथा “और दिखाएँ” बड़े संग्रह को चरणों में खोलते हैं। नियमित JSON backup और मूल images अलग सुरक्षित रखें। Local draft उसी browser/device में रहता है। Cloud draft Save के बाद अधिकृत admin दूसरे device से उसे खोल सकता है; प्रकाशित catalog सभी users को मिलता है।

## App settings

App नाम, announcement, support संपर्क, मुख्य रंग, poster/video availability, Library user upload और maintenance notice बदल सकते हैं। Settings पहले draft होती हैं; Cloud Publish या GitHub publication के बाद live होती हैं। ये interface controls हैं, server-side access controls नहीं।

## Free setup की बाकी स्थिति

Hosting GitHub Pages है। Vercel या भुगतान का उपयोग नहीं किया गया। Email login और admin cloud catalog का code जुड़ा है; Verified owner और admin grant जुड़े हैं। Users के निजी poster cloud slots भी जुड़े हैं। Workers AI का वास्तविक generation सत्यापन बाकी है। DNS और paid services में कोई बदलाव नहीं किया गया।


## Uploaded template का content बदलना
Poster / Templates में “खोलें और edit करें” दबाएँ। Templates tab में “Template का text / photo बदलें” के नीचे JSON की text और image layers के fields मिलेंगे। Text field में लिखें; Photo field से नई image चुनें। Canvas में चुनें से drag, resize और अन्य editor tools इस्तेमाल करें।

PNG/JPG की पुरानी lettering या photo मूल image में जुड़ी होती है। “Text का हिस्सा चुनें” या “Photo का हिस्सा चुनें” दबाकर canvas पर box बनाएँ, ढकने का रंग चुनें, फिर नई layer के field में text/photo डालें। मूल content उस जगह नई layer से ढकता है; automatic source-layer recovery नहीं है। Photo के पीछे patterned background हो तो matching रंग या अलग background patch चाहिए। OCR के लिए internet चाहिए और पहचान जाँचकर सुधारें। Editable JSON backup में नई layers बचती हैं; PNG/JPG export में वे फिर एक image बनती हैं।


## मूल image से Delete और Edit
हर अलग text/photo layer के नीचे Delete बटन है। PNG/JPG में “मूल image से text / photo मिटाएँ” से box चुनकर उस हिस्से के pixels हटाएँ। “मिटाने के बाद” में transparent या चुना background रंग चुनें। यह कोई overlay नहीं बनाता।

मूल image के अंदर Edit करने के लिए नया text, text रंग/size या नई photo चुनें, फिर “Image के अंदर Text Edit” या “Image के अंदर Photo Edit” दबाकर पुराना हिस्सा box में चुनें। नया content उसी image में सेव होता है। Undo/Redo से वापस जा सकते हैं। छिपा हुआ मूल background/पुराना font अपने आप वापस नहीं मिलता। PNG/JPG में जितना हिस्सा चुनेंगे उतना बदलता है; पीछे pattern हो तो matching background स्वयं तैयार करना होगा। Rotated/flipped images को पहले सामान्य स्थिति में लाएँ। बाहरी image के CORS रोकने पर उसे डाउनलोड करके upload करें।


## PNG/JPG के text को पहचानकर click से Edit
Poster upload करके खोलें। Header का Edit या canvas के पास “Auto पहचानकर Edit” दबाएँ। हिन्दी + English / English / বাংলা + English भाषा चुन सकते हैं। पहली बार OCR library और language data internet से डाउनलोड होते हैं; पहचान browser में होती है। पहचाने हुए text के चारों ओर boxes आते हैं। Box पर click से text, font, size, text/background रंग बदलें और “Text सेव करें” दबाएँ; “यह text Delete करें” उसी मूल image से text हटाता है। Undo/Redo और JSON backup में edited image व पहचाने हुए हिस्से बचते हैं। Boxes editing UI हैं, export में नहीं जाते।

हर image में OCR सफल या सही नहीं होता; अस्पष्ट, घुमे, decorative या छोटे text की spelling/box जाँचें। Original font या hidden patterned background अपने आप वापस नहीं आता। पहचान न होने पर manual Text/Photo बदलें विकल्प उपलब्ध हैं। Photo की जगह स्वयं box चुनें; automatic photo segmentation उपलब्ध नहीं है।


## रोज के अवसर वाले posters (2 अक्टूबर 2026)

1. Admin Workspace में category चुनें: त्योहार, राजनीतिक, जयंती, पुण्यतिथि या दैनिक शुभकामनाएँ।
2. अवसर/विषय और उसकी तारीख भरकर PNG/JPG या editable JSON upload करें। हर template की तारीख बाद में भी बदली जा सकती है।
3. केवल स्थिर तारीख वाले अवसर पर “हर साल इसी तारीख” चुनें। बदलती त्योहार तारीख हर साल सही करें।
4. User Library में दिखाई देने वाला checkbox चालू रखें, Catalog JSON डाउनलोड करें और अधिकृत GitHub owner से प्रकाशित करें। यह browser draft है; Save करने मात्र से सभी users तक नहीं पहुँचता।
5. User Poster / Templates → आज के posters या अपनी तारीख → अपना नाम / Logo लगाएँ चुनता है।
6. नाम, संस्था, Mobile/WhatsApp, social links और logo भरें। जानकारी इस device पर सेव होती है; cloud account sync अभी नहीं है।
7. नामपट्टी ऊपर या नीचे रखें; template में वहाँ खाली जगह छोड़ें। हर text/logo अलग editable layer है। दोबारा लगाने पर पिछली नामपट्टी बदलेगी। Undo/Redo और Save उपलब्ध हैं।
8. Download / Share से तैयार file लें या उपलब्ध mobile share menu में app चुनें। यह social accounts पर automatic scheduled publishing नहीं है।

रोज की artwork admin तैयार/upload करेगा; app अपने-आप जयंती/पुण्यतिथि की जानकारी या सही त्योहार तारीख नहीं बनाता। Original poster के pixels नहीं बदले जाते; नामपट्टी चुनी जगह पर दिखती है।

## Cloud setup और सीमाएँ

Studio का अलग Supabase project है; ERP project अलग और अपरिवर्तित है। Verified owner को admin अधिकार दिया गया है; नए signup से admin अधिकार नहीं मिलते। Password/OTP chat में साझा न करें। Custom SMTP जोड़ा गया है; email delivery, sender limits और Spam folder की वास्तविक जाँच जरूरी है।

हर cloud image अधिकतम 2 MB और catalog अधिकतम 10 MB है। Draft images भी public asset URL पर रहती हैं: confidential images upload न करें। Catalog से poster हटाना storage image को delete नहीं करता, ताकि पुराने saved designs काम करें। Storage quota की निगरानी और बाद में सुरक्षित cleanup जरूरी है; free service unlimited नहीं है। Concurrent admin बदलाव पर conflict दिखता है: backup लेकर नया cloud draft खोलें और बदलाव दोबारा मिलाएँ।

Complimentary membership रिकॉर्ड जुड़ा है। Payment collection और paid AI generation अभी सक्रिय नहीं हैं।

## मुफ्त Business Manual Membership

`membership.html` पर user Login करके अपनी User ID admin को दे। Admin Workspace → Business users में अधिकृत admin उस UUID और 1–365 दिनों की अवधि को Save कर सकता है। यह complimentary manual membership का cloud रिकॉर्ड है, admin अधिकार या AI credits नहीं। नया grant पुरानी समाप्ति तारीख को आज से चुने दिनों तक बदल देता है। User केवल अपना membership रिकॉर्ड देख सकता है।

₹10 activation → 15 दिन trial और ₹100/month manual plan page पर प्रस्ताव के रूप में दिखते हैं। Payment, paid subscription और paid export enforcement अभी सक्रिय नहीं हैं; editor अभी खुला है। बिना verified payment के paid access सक्रिय न करें।

## Social Share और Caption

Poster/video में Share दबाएँ → अपना संदेश/hashtags लिखें → platform button या apps में भेजें दबाएँ → फोन की Share सूची से app चुनें। यह तैयार image/video file भेजता है; platform पर खुद post नहीं करता। कुछ apps caption नहीं लेते; संदेश Copy करके वहाँ Paste करें। File sharing न मिलने पर Download करके attach करें। Video अभी WebM है; जिस social app में WebM स्वीकार न हो, उसमें compatible format की जरूरत रहेगी। Video बदलने पर पहले नया export बनाएँ: पुराने export को Share में रोक दिया जाता है।

## Private Cloud Posters और membership controls

User Membership page पर Login करे। Studio में Poster / Templates → मेरे Cloud Posters से 1–5 slot चुनकर खुले poster को नाम सहित Save करे। दूसरे device पर उसी account से Login करके slot खोलें। Poster JSON और उसमें embedded photos private row में रहते हैं; दूसरे users और सामान्य admin को इन personal project rows की अनुमति नहीं है। हर project 2 MB से छोटा रखें। Existing slot बदलने से पहले JSON backup लें। दूसरे device ने बदलाव किया हो तो conflict पर cloud project दोबारा खोलकर बदलाव मिलाएँ। यह poster sync है; video/audio project cloud sync अभी नहीं है।

Admin में Membership सूची देखें / Refresh से अधिकतम 100 records दिखते हैं। अवधि बदलें / फिर चालू करें से User ID form में आता है; आज से 1–365 दिन चुनकर Grant दें। मुफ्त Access वापस लें से record revoked होता है; दोबारा Grant देकर वापस चालू कर सकते हैं। Manual editor का paywall अभी लागू नहीं है, इसलिए यह membership status बदलता है; अभी खुले editor को बंद नहीं करता।

## Users / Profiles और Account सहायता — 2 October 2026

Admin → Users / Profiles में नाम, email, संस्था, mobile या WhatsApp खोजें। Membership filter से सभी, सक्रिय, 7 दिन में समाप्त, अवधि समाप्त, वापस लिए गए Access या बिना membership वाले users चुनें। प्रति पेज 50 records; पहला/पिछला/अगला/आखिरी और page jump उपलब्ध हैं। Desktop में cards साथ-साथ और mobile में नीचे-नीचे आते हैं। पूरा विवरण दबाने पर निजी account विवरण खुलता है; यह सूची केवल अधिकृत admin को मिलती है।

Membership page पर user नया account बना सकता है, login कर सकता है, User ID copy कर सकता है और Profile बदल सकता है। Password भूल गए / Email verify करें खोलें: email भरकर reset या verification link माँगें। सबसे नया link इस्तेमाल करें। Reset link Membership page पर नया Password form खोलता है। Password दो बार समान भरें और Save करें। पुराना/समाप्त link होने पर नया माँगें। लिंक, password और OTP किसी को न दें। वास्तविक mailbox delivery का end-to-end परीक्षण बाकी है।

Admin के Validity reminder और Email खोलें केवल संदेश तैयार करते हैं; भेजना admin को होगा। Automatic reminders के लिए server-side scheduler, delivery log/deduplication और email/SMS provider चाहिए। Brevo SMTP auth email के लिए है; arbitrary business reminders हेतु अलग server credential setup जरूरी है। Paid SMS अभी नहीं जोड़ा है।

## अभी चालू न मानें

Payment checkout/webhook, ₹10 activation/15-day paid trial, ₹100 subscription enforcement, prepaid AI credits, professional AI audio/video, MP4 conversion और video/audio cloud backup बाकी हैं। इन पर account/provider लागत तय किए बिना पैसे न लें। Manual editor अभी खुला है; complimentary membership status इसका paywall नहीं बनाता। Phone पर selection, microphone, audio/export और installation का अंतिम device परीक्षण जरूरी है।

## Cloud poster slot खाली करना

मेरे Cloud Posters में सेव slot चुनें → JSON backup लेकर हटाएँ → पुष्टि करें। JSON download शुरू होता है; फिर केवल आपके account का चुना cloud poster हटता है। Download पूरा होने की स्वयं जाँच करें। Canvas में खुला poster और local gallery नहीं हटते। दूसरे device से poster बदलने पर delete रुकता है; सूची Refresh करके नया poster खोलें। खाली slot में नया poster Save कर सकते हैं।

## Video download format

Video Studio में Download format से WebM या MP4 चुनें। MP4 केवल उस browser में चालू होता है जहाँ native recording support मिले; यह server-side converter नहीं है। Audio वाला MP4 बनाने के लिए उस browser में संबंधित audio codec भी उपलब्ध होना चाहिए। समस्या पर WebM चुनें। तैयार file की playback और आवाज़ वास्तविक device पर जाँचना बाकी है। Project में बदलाव के बाद पहले नया video export बनाएँ; पुराना export Share में रोका जाता है।
