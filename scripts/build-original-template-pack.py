"""Build APANAM's original, layered poster collection (no external artwork)."""
import json, html
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
categories=[
('दैनिक शुभकामनाएँ','सुप्रभात','हर सुबह एक नई शुरुआत','शुभ संध्या','सुकून भरे पलों के नाम'),
('Product','NEW COLLECTION','Thoughtfully made. Beautifully yours.','SPECIAL OFFER','Your next favourite starts here.'),
('Social','CREATE SOMETHING','Share your story with the world.','YOUR NEXT CHAPTER','Small ideas. Meaningful moments.'),
('त्योहार','शुभ दीपावली','खुशियों और प्रकाश का उत्सव','त्योहार की शुभकामनाएँ','अपनों के साथ खुशियाँ बाँटें'),
('जयंती','जयंती पर नमन','विचार जो पीढ़ियों को प्रेरित करें','सादर नमन','प्रेरणा • सेवा • संकल्प'),
('पुण्यतिथि','विनम्र श्रद्धांजलि','आपकी स्मृतियाँ सदैव हमारे साथ','स्मृति में नमन','जीवन और योगदान को सादर प्रणाम'),
('राजनीतिक','जनसेवा का संकल्प','आपकी आवाज़ • हमारा प्रयास','संवाद से समाधान','साथ मिलकर आगे बढ़ें'),
('संस्था','एक साथ बेहतर','हमारी संस्था • हमारा संकल्प','सेवा और सहयोग','समाज के लिए एक नया कदम'),
('Business','BUILD YOUR BRAND','A clear idea. A confident identity.','LET’S GROW','Connect with our business today.'),
('Wedding','THE WEDDING','Together begins a beautiful journey.','शुभ विवाह','दो दिल • एक नई शुरुआत'),
('Birthday','HAPPY BIRTHDAY','A day made for wonderful wishes.','जन्मदिन मुबारक','खुशियों से भरा रहे हर दिन'),
('Education','LEARN. CREATE. GROW.','Admissions open • Start your journey.','नई शुरुआत','सीखने और आगे बढ़ने का अवसर'),
('Healthcare','CARE EVERY DAY','Health awareness • Speak to a professional.','स्वास्थ्य जागरूकता','स्वस्थ आदतें • बेहतर जीवन'),
('Restaurant','TASTE THE MOMENT','Fresh flavours. Warm welcomes.','TODAY’S SPECIAL','Discover something delicious.'),
('Real Estate','A PLACE TO CALL HOME','Explore your next address.','WELCOME HOME','Spaces for your next chapter.'),
('Travel','TAKE THE SCENIC ROUTE','Discover your next destination.','TIME TO EXPLORE','Make room for new memories.')]
palettes=[('#fff7e9','#4b3426','#dd9945'),('#eaf1f6','#173847','#468fa4'),('#f6ecf3','#582e4f','#b36390'),('#eef4ed','#244537','#699173')]
def element(name,x,y,w,h,css,body,text=None,slot=None):
 attrs=f'class="element'+(' text' if text is not None else '')+'" data-name="'+html.escape(name,quote=True)+'"'
 if text is not None: attrs+=' data-type="text" data-text="'+html.escape(text,quote=True)+'"'
 if slot: attrs+=' data-brand-slot="'+slot+'"'
 return f'<div {attrs} style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;box-sizing:border-box;{css}">{body}</div>'
def text(name,value,x,y,w,size,color,slot=None):
 return element(name,x,y,w,size*2.9,f'font-family:Arial,sans-serif;font-size:{size}px;font-weight:700;line-height:1.2;color:{color};white-space:pre-wrap;overflow-wrap:break-word;z-index:4',html.escape(value),value,slot)
items=[]
for c,row in enumerate(categories):
 category,*copy=row
 for variant in range(2):
  bg,ink,accent=palettes[(c+variant)%4];title,sub=copy[variant*2:variant*2+2];art=['botanical','sunrise','arch','landscape'][(c+variant)%4]
  nodes=[element('Accent frame',22,22,496,676,f'border:1px solid {accent};border-radius:{18 if variant else 0}px;z-index:1',''),element('Accent circle',365,60,110,110,f'background:{accent};opacity:.16;border-radius:50%;z-index:1','')]
  if not variant:
   nodes+=[text('Brand / संस्था','YOUR BRAND',44,45,370,16,ink,'organization'),text('Main headline',title,44,109,450,34,ink),text('Subtitle',sub,44,213,450,17,ink),element('Artwork / Photo · Replace',70,285,400,280,'z-index:2',f'<img src="./template-assets/{art}.svg" alt="Original APANAM illustration — replace with your photo" style="width:100%;height:100%;object-fit:contain">')]
  else:
   nodes+=[element('Artwork / Photo · Replace',30,40,480,330,'z-index:2',f'<img src="./template-assets/{art}.svg" alt="Original APANAM illustration — replace with your photo" style="width:100%;height:100%;object-fit:contain">'),element('Title panel',36,350,468,195,f'background:{bg};border-radius:18px;border:1px solid {accent};z-index:3',''),text('Main headline',title,56,370,428,32,ink),text('Subtitle',sub,56,461,428,16,ink),text('Brand / संस्था','YOUR BRAND',44,569,440,17,ink,'organization')]
  nodes += [element('Footer rule',44,621,452,2,f'background:{accent};z-index:1',''),text('Your name','आपका नाम / YOUR NAME',44,642,450,17,ink,'person'),text('Contact','अपना संपर्क / CONTACT',44,677,450,13,ink,'contact')]
  item={'id':f'apanam-original-{c+1:02}-{variant+1}','name':title+' · '+('Editorial' if variant==0 else 'Art Card'),'category':category,'published':True,'occasion':'Daily greeting' if c==0 else category,'project':{'version':2,'width':1080,'height':1440,'bgColor':bg,'bgImage':'','transparent':False,'html':''.join(nodes)}}
  if c==3: item.update(eventDate='2026-11-08' if variant==0 else '',repeatYearly=False)
  items.append(item)
(ROOT/'studio-original-templates.json').write_text(json.dumps({'format':'apanam-studio-catalog','version':1,'settings':{},'templates':items},ensure_ascii=False,indent=2)+'\n')
