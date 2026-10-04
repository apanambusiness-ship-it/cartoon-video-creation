import json, hashlib, urllib.request, time, io
from pathlib import Path
import cairosvg
from PIL import Image
parties = [["bjp","भाजपा · BJP","Logo of the Bharatiya Janata Party.svg"],["inc","कांग्रेस · INC","Indian National Congress hand logo.svg"],["aap","आम आदमी पार्टी · AAP","Aam Aadmi Party logo.svg"],["tmc","तृणमूल कांग्रेस · TMC","All India Trinamool Congress logo.svg"],["cpim","CPI(M)","Cpm election symbol.svg"],["jmm","झारखंड मुक्ति मोर्चा · JMM","Jharkhand Mukti Morcha logo.svg"],["shiv-sena","शिवसेना · Logo","Logo of Shiv Sena.svg"],["bsp","बसपा · BSP Flag","Bahujan Samaj Party Flag.svg"],["sp","समाजवादी पार्टी · SP Flag","Samajwadi Party Flag.svg"]]
catalog_path = Path('studio-creative-catalog.json')
catalog = json.loads(catalog_path.read_text())
sources=[]
for key, name, filename in parties:
    filename=filename.replace(' ', '_')
    digest=hashlib.md5(filename.encode()).hexdigest()
    url='https://upload.wikimedia.org/wikipedia/commons/'+digest[0]+'/'+digest[:2]+'/'+urllib.parse.quote(filename)
    url=url.replace('/commons/', '/commons/thumb/')+'/960px-'+urllib.parse.quote(filename)+'.png'
    time.sleep(2)
    for attempt in range(3):
        try:
            req=urllib.request.Request(url, headers={'User-Agent':'APANAM-CreativeStudio/1.0 (public political symbol library)'})
            png=urllib.request.urlopen(req, timeout=45).read()
            im=Image.open(io.BytesIO(png))
            im.verify()
            im=Image.open(io.BytesIO(png))
            asset='party-'+key
            Path('creative-assets/'+asset+'.png').write_bytes(png)
            item={'id':'creative-el-'+asset,'asset':asset,'format':'png','name':name,'category':'राजनीतिक पार्टी','tags':key+' '+name+' political party logo symbol राजनीति','width':im.width,'height':im.height}
            catalog['elements']=[e for e in catalog['elements'] if e['id']!=item['id']]
            catalog['elements'].append(item)
            sources.append({'asset':asset,'name':name,'source':'https://commons.wikimedia.org/wiki/File:'+filename,'license':'See original Wikimedia Commons file description for author and license.'})
            print('VERIFIED', name, im.size)
            break
        except Exception:
            if attempt==2: raise
            time.sleep(5*(attempt+1))
catalog['version']=str(catalog.get('version','1'))+'-political1'
catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
Path('creative-assets/political-sources.json').write_text(json.dumps(sources,ensure_ascii=False,indent=2)+'\n')
