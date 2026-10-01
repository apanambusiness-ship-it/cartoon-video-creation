# APANAMai STUDIO — मुफ्त Admin और Template Guide

## कौन क्या कर सकता है

- Users: प्रकाशित templates खोलना, text/photo/logo बदलना, अपनी image या editable JSON upload करना, और export/backup डाउनलोड करना।
- Admin: `admin.html` में template जोड़ना, नाम/category बदलना, duplicate करना, hide/delete करना, editor में layers बदलना, app settings तैयार करना और catalog backup लेना।
- Live publication: GitHub repository का अधिकृत owner/maintainer `studio-catalog.json` upload करके commit करता है। Public admin page केवल अपने browser के drafts बदल सकता है। किसी visitor को live publish अनुमति नहीं मिलती। Password या access token frontend में नहीं रखा गया है।
- Software changes: admin workspace का “Software source / सभी files” लिंक खोलकर GitHub में code/features बदलें। प्रत्येक commit का इतिहास और deployment status उपलब्ध है।

## Poster / template जोड़ना

1. Admin Workspace → Posters / Templates → Category लिखें।
2. कई images या JSON files एक साथ चुनें। Draft IndexedDB में सेव होता है।
3. “Editor में बदलें” से poster खोलें। Photo, text और logo edit करें। ऊपर “Template बदलाव admin में सेव करें” दबाएँ।
4. Name/category बदलें। “User Library में दिखाएँ” हटाने पर template अगले publication के बाद छिपेगा।
5. Catalog JSON download करके GitHub में root पर `studio-catalog.json` upload/replace और commit करें। Deployment हरा होने पर app refresh करें।

JPG/PNG में पुराने text/photos अलग layers नहीं होते। Image एक layer के रूप में खुलती है; नई text/photo/logo layers जोड़ सकते हैं। पूरी तरह editable template के लिए editor का Save JSON इस्तेमाल करें।

Template संख्या पर कोई तय सीमा नहीं रखी गई है। Browser storage और hosting/file-size limits फिर भी लागू हैं। Search तथा “और दिखाएँ” बड़े संग्रह को चरणों में खोलते हैं। नियमित JSON backup और मूल images अलग सुरक्षित रखें। Draft केवल उसी browser/device में रहता है; प्रकाशित catalog सभी users को मिलता है।

## App settings

App नाम, announcement, support संपर्क, मुख्य रंग, poster/video availability, Library user upload और maintenance notice बदल सकते हैं। Settings पहले draft होती हैं; GitHub publication के बाद live होती हैं। ये interface controls हैं, server-side access controls नहीं।

## Free setup की बाकी स्थिति

Hosting GitHub Pages है। Vercel या भुगतान का उपयोग नहीं किया गया। Workers AI, verified email login तथा cloud project sync के लिए अलग authenticated server/account configuration जरूरी है; उन्हें इस static admin page में सक्रिय बताकर नहीं दिखाया गया है। DNS और paid services में कोई बदलाव नहीं किया गया।


## Uploaded template का content बदलना
Poster / Templates में “खोलें और edit करें” दबाएँ। Templates tab में “Template का text / photo बदलें” के नीचे JSON की text और image layers के fields मिलेंगे। Text field में लिखें; Photo field से नई image चुनें। Canvas में चुनें से drag, resize और अन्य editor tools इस्तेमाल करें।

PNG/JPG की पुरानी lettering या photo मूल image में जुड़ी होती है। “Text का हिस्सा चुनें” या “Photo का हिस्सा चुनें” दबाकर canvas पर box बनाएँ, ढकने का रंग चुनें, फिर नई layer के field में text/photo डालें। मूल content उस जगह नई layer से ढकता है; automatic source-layer recovery नहीं है। Photo के पीछे patterned background हो तो matching रंग या अलग background patch चाहिए। OCR के लिए internet चाहिए और पहचान जाँचकर सुधारें। Editable JSON backup में नई layers बचती हैं; PNG/JPG export में वे फिर एक image बनती हैं।


## मूल image से Delete और Edit
हर अलग text/photo layer के नीचे Delete बटन है। PNG/JPG में “मूल image से text / photo मिटाएँ” से box चुनकर उस हिस्से के pixels हटाएँ। “मिटाने के बाद” में transparent या चुना background रंग चुनें। यह कोई overlay नहीं बनाता।

मूल image के अंदर Edit करने के लिए नया text, text रंग/size या नई photo चुनें, फिर “Image के अंदर Text Edit” या “Image के अंदर Photo Edit” दबाकर पुराना हिस्सा box में चुनें। नया content उसी image में सेव होता है। Undo/Redo से वापस जा सकते हैं। छिपा हुआ मूल background/पुराना font अपने आप वापस नहीं मिलता। PNG/JPG में जितना हिस्सा चुनेंगे उतना बदलता है; पीछे pattern हो तो matching background स्वयं तैयार करना होगा। Rotated/flipped images को पहले सामान्य स्थिति में लाएँ। बाहरी image के CORS रोकने पर उसे डाउनलोड करके upload करें।


## PNG/JPG के text को पहचानकर click से Edit
Poster upload करके खोलें। Header का Edit या canvas के पास “Auto पहचानकर Edit” दबाएँ। हिन्दी + English / English / বাংলা + English भाषा चुन सकते हैं। पहली बार OCR library और language data internet से डाउनलोड होते हैं; पहचान browser में होती है। पहचाने हुए text के चारों ओर boxes आते हैं। Box पर click से text, font, size, text/background रंग बदलें और “Text सेव करें” दबाएँ; “यह text Delete करें” उसी मूल image से text हटाता है। Undo/Redo और JSON backup में edited image व पहचाने हुए हिस्से बचते हैं। Boxes editing UI हैं, export में नहीं जाते।

हर image में OCR सफल या सही नहीं होता; अस्पष्ट, घुमे, decorative या छोटे text की spelling/box जाँचें। Original font या hidden patterned background अपने आप वापस नहीं आता। पहचान न होने पर manual Text/Photo बदलें विकल्प उपलब्ध हैं। Photo की जगह स्वयं box चुनें; automatic photo segmentation उपलब्ध नहीं है।
