"""Build editable occasion templates using independent text, image and shape layers."""
import base64,html,io,json
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1]
image=Image.new('RGB',(360,420),'#e2e8f0');draw=ImageDraw.Draw(image);draw.ellipse((115,68,245,198),fill='#94a3b8');draw.rounded_rectangle((58,221,302,420),radius=115,fill='#94a3b8');out=io.BytesIO();image.save(out,format='PNG');PHOTO='data:image/png;base64,'+base64.b64encode(out.getvalue()).decode()
def shape(name,x,y,w,h,color,radius=0):
 return f'<div class="element" data-kind="shape" data-type="shape" data-name="{html.escape(name)}" style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;background:{color};border-radius:{radius}px;z-index:1"></div>'
def text(name,value,x,y,w,h,size,color,weight=600,align='left'):
 slot={'संस्था':'organization','आपका नाम':'person','संपर्क':'contact'}.get(name);brand=f' data-brand-slot="{slot}"' if slot else ''
 return f'<div class="element text"{brand} data-type="text" data-name="{html.escape(name)}" data-text="{html.escape(value,quote=True)}" style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;font-family:system-ui,sans-serif;font-size:{size}px;font-weight:{weight};line-height:1.35;color:{color};text-align:{align};white-space:pre-wrap;z-index:3">{html.escape(value)}</div>'
def photo(x,y,w,h):
 return f'<div class="element" data-kind="image" data-type="image" data-name="Photo · अपना चित्र लगाएँ" style="position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;z-index:2"><img alt="अपनी photo से बदलें" src="{PHOTO}" style="width:100%;height:100%;object-fit:cover;border-radius:16px"></div>'
def make(key,name,category,headline,subtitle,accent,bg,ink,portrait=False,date='',occasion=''):
 layers=shape('Top accent',0,0,540,12,accent)+shape('Footer band',0,440,540,100,ink)
 layers+=text('संस्था', 'आपकी संस्था / Brand',32,28,476,38,20,ink)
 layers+=text('मुख्य संदेश',headline,32,90,476,114,36,ink,800)
 if portrait:
  layers+=photo(32,225,158,185)+text('व्यक्ति का नाम','महापुरुष का नाम',216,240,292,76,26,ink,700)+text('सम्मान संदेश',subtitle,216,330,292,78,17,ink)
 else:
  layers+=shape('Design accent',32,241,64,6,accent,3)+text('शुभकामना संदेश',subtitle,32,274,476,100,24,ink,500)+text('अवसर / तारीख','अवसर / तारीख यहाँ लिखें',32,388,476,32,16,ink)
 layers+=text('आपका नाम','शुभेच्छु · आपका नाम',32,456,476,31,21,'#ffffff',700)+text('संपर्क','मोबाइल · Social link यहाँ लिखें',32,499,476,26,14,'#ffffff',500)
 return {'id':'occasion-'+key,'name':name,'category':category,'published':True,'occasion':occasion or category,'eventDate':date,'repeatYearly':False,'updatedAt':'2026-10-02','project':{'version':2,'html':layers,'width':1080,'height':1080,'bgColor':bg,'bgImage':'','transparent':False}}
pack=[make('morning','सुप्रभात · Daily Greeting','दैनिक शुभकामनाएँ','सुप्रभात!','नई सुबह, नई शुरुआत।\nआपका दिन मंगलमय हो।','#d99d30','#fff9ee','#533a22',date='2026-10-02',occasion='दैनिक सुप्रभात'),make('festival','त्योहार · Festive Wishes','त्योहार','खुशियों का उत्सव','आपको और आपके परिवार को\nत्योहार की हार्दिक शुभकामनाएँ।','#f6bb51','#fff4e9','#7b2e27'),make('jayanthi','जयंती · श्रद्धापूर्ण नमन','जयंती','जयंती पर\nशत-शत नमन','उनके विचार और आदर्श\nहमारी प्रेरणा हैं।','#bd9447','#fffaf0','#344638',portrait=True),make('tribute','पुण्यतिथि · विनम्र श्रद्धांजलि','पुण्यतिथि','विनम्र\nश्रद्धांजलि','पुण्यतिथि पर\nसादर स्मरण एवं नमन।','#94a3b8','#f1f5f9','#26364a',portrait=True),make('public-program','जनसेवा संवाद · कार्यक्रम','राजनीतिक','जनसेवा संवाद','कार्यक्रम का विषय यहाँ लिखें।\nआपकी सहभागिता का स्वागत है।','#ed994c','#fffaf2','#203d50',occasion='सार्वजनिक कार्यक्रम'),make('institution','संस्था · घोषणा / निमंत्रण','संस्था','सादर आमंत्रण','कार्यक्रम / घोषणा यहाँ लिखें।\nस्थान और समय जोड़ें।','#9374c9','#f6f2fc','#40325e')]
(ROOT/'occasion-template-pack.json').write_text(json.dumps({'format':'apanam-studio-catalog','version':1,'settings':json.loads((ROOT/'studio-catalog.json').read_text())['settings'],'templates':pack},ensure_ascii=False,indent=2))
catalog=json.loads((ROOT/'studio-catalog.json').read_text());ids={t['id'] for t in catalog['templates']};catalog['templates'] += [t for t in pack if t['id'] not in ids];(ROOT/'studio-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
print('Built',len(pack),'templates; catalog has',len(catalog['templates']))
