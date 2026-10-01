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
