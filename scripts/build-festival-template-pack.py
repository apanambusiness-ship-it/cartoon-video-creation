"""Rebuild festival templates from original text-free artwork and native text layers."""
import html, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# id, title, headline x/y/width/size, greeting y, text color
DESIGNS = [
    ('makar-sankranti', 'मकर संक्रांति', 85, 190, 395, 43, 300, '#8d320c'),
    ('basant-panchami', 'बसंत पंचमी', 155, 145, 330, 40, 245, '#87390c'),
    ('mahashivratri', 'महाशिवरात्रि', 45, 155, 422, 44, 255, '#fff2c7'),
    ('holi', 'होली', 75, 190, 380, 78, 300, '#a70848'),
    ('ram-navami', 'राम नवमी', 65, 315, 395, 59, 420, '#a9360c'),
    ('baisakhi', 'बैसाखी', 75, 150, 405, 64, 255, '#993a0b'),
    ('eid', 'ईद मुबारक', 60, 200, 390, 58, 305, '#064c32'),
    ('raksha-bandhan', 'रक्षाबंधन', 85, 210, 395, 52, 310, '#920c22'),
    ('janmashtami', 'जन्माष्टमी', 155, 195, 335, 46, 290, '#ffdc8a'),
    ('ganesh-chaturthi', 'गणेश चतुर्थी', 245, 150, 240, 44, 290, '#aa280c'),
    ('navratri', 'नवरात्रि', 65, 500, 385, 60, 595, '#940e16'),
    ('dussehra', 'दशहरा', 140, 170, 345, 62, 270, '#9a2e0b'),
    ('diwali', 'दीपावली', 65, 210, 395, 62, 315, '#ffdf97'),
    ('chhath', 'छठ पूजा', 80, 200, 395, 55, 305, '#87370c'),
    ('guru-nanak-jayanti', 'गुरु नानक जयंती', 45, 245, 422, 40, 320, '#ffdf9d'),
    ('christmas', 'क्रिसमस', 65, 205, 390, 62, 315, '#8c1530'),
]

def text(name, value, x, y, width, size, color, slot=None):
    attrs = f'class="element text" data-type="text" data-name="{html.escape(name)}" data-text="{html.escape(value, quote=True)}"'
    if slot:
        attrs += f' data-brand-slot="{slot}"'
    height = size * (2.7 if name == 'त्योहार का नाम' else 1.65)
    style = f'position:absolute;left:{x}px;top:{y}px;width:{width}px;height:{height}px;box-sizing:border-box;font-family:"Noto Sans Devanagari",Arial,sans-serif;font-size:{size}px;font-weight:700;line-height:1.25;color:{color};text-align:center;white-space:pre-wrap;overflow-wrap:break-word;z-index:4'
    return f'<div {attrs} style="{style}">{html.escape(value)}</div>'

def build():
    path = ROOT / 'studio-original-templates.json'
    catalog = json.loads(path.read_text())
    catalog['templates'] = [t for t in catalog['templates'] if not t['id'].startswith('apanam-festival-')]
    items = []
    for slug, title, x, y, width, size, greeting_y, color in DESIGNS:
        asset = f'festival-assets/{slug}.webp'
        if not (ROOT / asset).is_file():
            raise FileNotFoundError(asset)
        nodes = [f'<div class="element locked" data-name="{html.escape(title)} · Background" data-locked="1" style="position:absolute;left:0px;top:0px;width:512px;height:768px;box-sizing:border-box;z-index:0"><img src="./{asset}" alt="{html.escape(title)} original festival background" style="width:100%;height:100%;object-fit:cover"></div>']
        nodes.append(text('त्योहार का नाम', title, x, y, width, size, color))
        nodes.append(text('शुभकामना', 'हार्दिक शुभकामनाएँ', x, greeting_y, width, 23, color))
        nodes.append('<div class="element locked" data-name="नामपट्टी" data-locked="1" style="position:absolute;left:28px;top:663px;width:456px;height:92px;box-sizing:border-box;background:rgba(255,248,228,.94);border-radius:12px;border:1px solid #d3a45a;z-index:2"></div>')
        nodes.append(text('संस्था', 'आपकी संस्था', 42, 671, 428, 17, '#5d301b', 'organization'))
        nodes.append(text('आपका नाम', 'आपका नाम', 42, 701, 428, 21, '#783214', 'person'))
        nodes.append(text('संपर्क', 'अपना संपर्क लिखें', 42, 736, 428, 11, '#5d301b', 'contact'))
        items.append({'id': 'apanam-festival-' + slug, 'name': title + ' · Real Art', 'category': 'त्योहार · वर्षभर', 'published': True, 'occasion': title, 'project': {'version': 2, 'width': 1024, 'height': 1536, 'bgColor': '#fff7e5', 'bgImage': '', 'transparent': False, 'html': ''.join(nodes)}})
    catalog['templates'] = items + catalog['templates']
    path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    print(f'Built {len(items)} editable festival templates; {len(catalog["templates"])} total.')

if __name__ == '__main__':
    build()
