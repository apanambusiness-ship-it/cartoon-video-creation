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

Hosting GitHub Pages है। Vercel या भुगतान का उपयोग नहीं किया गया। Email login और admin cloud catalog का code जुड़ा है; पहला verified owner account और उसका admin grant अभी जरूरी है। Workers AI और user project cloud sync अभी लागू नहीं हैं। DNS और paid services में कोई बदलाव नहीं किया गया।


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

Studio का अलग Supabase project है; ERP project अलग और अपरिवर्तित है। पहला owner अपना account बनाकर email verify करे; उसके verified Auth user को database में admin grant देना अभी जरूरी है। Password/OTP chat में साझा न करें। Default email delivery सीमित है; सार्वजनिक customer signup से पहले production SMTP configure करना होगा।

हर cloud image अधिकतम 2 MB और catalog अधिकतम 10 MB है। Draft images भी public asset URL पर रहती हैं: confidential images upload न करें। Catalog से poster हटाना storage image को delete नहीं करता, ताकि पुराने saved designs काम करें। Storage quota की निगरानी और बाद में सुरक्षित cleanup जरूरी है; free service unlimited नहीं है। Concurrent admin बदलाव पर conflict दिखता है: backup लेकर नया cloud draft खोलें और बदलाव दोबारा मिलाएँ।

Membership, payment collection तथा paid AI generation अभी लागू नहीं हुए हैं।
