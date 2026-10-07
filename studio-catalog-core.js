(()=>{
  'use strict';
  const format='apanam-studio-catalog';
  function safeHTML(html){
    const template=document.createElement('template');template.innerHTML=String(html||'');
    template.content.querySelectorAll('script,iframe,object,embed,link,meta,base,form,input,textarea,select,button,foreignObject,animate,set').forEach(el=>el.remove());
    for(const el of template.content.querySelectorAll('*'))for(const attr of [...el.attributes]){
      const name=attr.name.toLowerCase(),value=attr.value.trim();
      if(name.startsWith('on')||name==='srcdoc'||name==='id'||name==='data-drag-fix'||name==='autofocus'||name==='contenteditable'||name==='srcset'||((name==='href'||name==='xlink:href'||name==='src')&&!/^(data:image\/(png|jpeg|webp|gif);base64,|https?:\/\/|\.\.?\/|#)/i.test(value)))el.removeAttribute(attr.name);
    }
    template.content.querySelectorAll('.handle,.rotateHandle,.smartGuide,.template-region-selector,.ocr-editor-hits').forEach(el=>el.remove());
    return template.innerHTML;
  }
  function project(value){
    if(!value||typeof value.html!=='string')throw Error('सही editable poster JSON चुनें।');
    const width=Number(value.width)||1080,height=Number(value.height)||1080;
    if(!Number.isFinite(width)||!Number.isFinite(height)||width<100||height<100||width>8192||height>8192)throw Error('Canvas size 100–8192 pixels के बीच रखें।');
    const html=safeHTML(value.html);if(!html.trim())throw Error('Template खाली है।');
    return {version:2,html,width,height,bgColor:/^(#[0-9a-f]{3,8}|transparent|rgba?\([\d\s.,%]+\))$/i.test(value.bgColor||'')?value.bgColor:'#ffffff',bgImage:typeof value.bgImage==='string'&&/^(data:image\/(png|jpeg|webp|gif);base64,|https?:\/\/)/i.test(value.bgImage)?value.bgImage:'',transparent:Boolean(value.transparent)};
  }
  function validDate(value){const v=String(value||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return '';const d=new Date(v+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v?v:''}
  function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
  function onDate(item,date){return item.category==='दैनिक शुभकामनाएँ'||Boolean(item.eventDate&&(item.repeatYearly?item.eventDate.slice(5)===date.slice(5):item.eventDate===date))}
  function catalog(value){
    if(value?.format!==format||!Array.isArray(value.templates))throw Error('सही APANAM catalog JSON चुनें।');
    const defaults={appName:'APANAMai STUDIO',announcement:'',contact:'',primaryColor:'#5b21b6',posterEnabled:true,videoEnabled:true,uploadsEnabled:true,maintenance:false,externalPostersEnabled:true,externalPosterBlocklist:''},raw=value.settings||{},settings={...defaults};
    for(const key of ['appName','announcement','contact'])settings[key]=String(raw[key]??defaults[key]).slice(0,key==='announcement'?1000:120);
    if(/^#[0-9a-f]{6}$/i.test(raw.primaryColor))settings.primaryColor=raw.primaryColor;
    for(const key of ['posterEnabled','videoEnabled','uploadsEnabled','maintenance','externalPostersEnabled'])if(typeof raw[key]==='boolean')settings[key]=raw[key];
    settings.externalPosterBlocklist=String(raw.externalPosterBlocklist||'').slice(0,12000);
    settings.hiddenTemplateIds=Array.isArray(raw.hiddenTemplateIds)?[...new Set(raw.hiddenTemplateIds.filter(id=>typeof id==='string'&&id.length>0&&id.length<=100))]:[];
    const ids=new Set();const templates=value.templates.map(item=>{
      if(!item||typeof item.id!=='string'||!item.id||ids.has(item.id))throw Error('Template IDs खाली या duplicate हैं।');ids.add(item.id);
      return {id:item.id.slice(0,100),name:String(item.name||'मेरा Template').slice(0,120),category:String(item.category||'General').slice(0,80),published:item.published!==false,eventDate:validDate(item.eventDate),repeatYearly:item.repeatYearly===true,occasion:String(item.occasion||'').slice(0,100),project:project(item.project),updatedAt:String(item.updatedAt||'')};
    });return {format,version:1,settings,templates};
  }
  async function imageProject(file){
    if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type))throw Error('PNG, JPG, WebP या GIF फोटो चुनें।');
    const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('फोटो पढ़ी नहीं गई।'));reader.readAsDataURL(file)});
    const image=new Image();image.src=src;await image.decode();const scale=Math.min(1,4096/Math.max(image.naturalWidth,image.naturalHeight)),width=Math.max(100,Math.round(image.naturalWidth*scale)),height=Math.max(100,Math.round(image.naturalHeight*scale));
    const node=document.createElement('div');node.className='element';node.dataset.kind='image';node.dataset.type='image';node.dataset.name=file.name;node.style.cssText=`position:absolute;left:0;top:0;width:${width/2}px;height:${height/2}px;z-index:1;`;const img=document.createElement('img');img.src=src;img.alt=file.name;img.style.cssText='width:100%;height:100%;object-fit:contain';node.append(img);
    return project({html:node.outerHTML,width,height,bgColor:'#ffffff'});
  }
  function download(value,name){const link=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000)}
  const draftDB=()=>new Promise((resolve,reject)=>{const request=indexedDB.open('apanam-admin-drafts',1);request.onupgradeneeded=()=>request.result.createObjectStore('drafts');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
  function publication(value){const clean=catalog(value),visible=new Set(clean.templates.filter(t=>t.published).map(t=>t.id));clean.settings.hiddenTemplateIds=[...new Set([...clean.settings.hiddenTemplateIds.filter(id=>!visible.has(id)),...clean.templates.filter(t=>!t.published).map(t=>t.id)])];clean.templates=clean.templates.filter(t=>t.published);return clean;}
  async function draft(write){const db=await draftDB();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('drafts',write?'readwrite':'readonly'),request=write?tx.objectStore('drafts').put(write,'catalog'):tx.objectStore('drafts').get('catalog');let value;request.onsuccess=()=>value=request.result;tx.oncomplete=()=>resolve(value);tx.onabort=()=>reject(tx.error||Error('Storage full'));tx.onerror=()=>reject(tx.error)})}finally{db.close()}}
  window.APANAM_CATALOG={publication,catalog,validDate,today,onDate,project,safeHTML,imageProject,download,draft,async load(){const originals=fetch('./studio-original-templates.json',{cache:'no-store',signal:AbortSignal.timeout(8000)}).then(r=>{if(!r.ok)throw Error('Original templates unavailable');return r.json()}).then(catalog).catch(error=>{console.warn(error.message);return null});let base;if(window.APANAM_CLOUD){try{base=await window.APANAM_CLOUD.load()}catch(error){console.warn('Cloud catalog unavailable; opening bundled templates',error.message)}}if(!base){const response=await fetch('./studio-catalog.json',{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('Catalog नहीं खुला।');base=catalog(await response.json());}const pack=await originals;if(pack){const ids=new Set(base.templates.map(t=>t.id)),hidden=new Set(base.settings.hiddenTemplateIds);base.templates.push(...pack.templates.filter(t=>!ids.has(t.id)&&!hidden.has(t.id)));}return base}};
})();

