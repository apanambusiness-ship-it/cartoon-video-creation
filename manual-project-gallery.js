/* Local project gallery: editable projects stay in this browser, JSON backup stays available. */
(()=>{
  const saveButton=document.getElementById('saveProject');
  const loadButton=document.getElementById('loadProject');
  const project=window.APANAM_PROJECT;
  const stage=document.getElementById('stage');
  if(!saveButton||!loadButton||!project?.snapshot||!stage||!window.indexedDB)return;
  const downloadJson=saveButton.onclick;
  const importJson=loadButton.onclick;
  saveButton.title='पोस्टर सेव करके गैलरी खोलें';
  loadButton.title='सेव किए पोस्टरों की गैलरी खोलें';
  let dbPromise;
  function db(){return dbPromise??=new Promise((resolve,reject)=>{
    const req=indexedDB.open('apanam-manual-gallery',1);
    req.onupgradeneeded=()=>req.result.createObjectStore('posters',{keyPath:'id'});
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  })}
  async function operation(mode,method,value){const database=await db();return new Promise((resolve,reject)=>{
    const tx=database.transaction('posters',mode),req=tx.objectStore('posters')[method](value);
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    tx.onerror=()=>reject(tx.error);
  })}
  const cover=document.createElement('div');
  cover.style.cssText='position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:#111827b8;padding:14px';
  const panel=document.createElement('div');
  panel.style.cssText='width:min(850px,96vw);max-height:90vh;overflow:auto;background:#fff;border-radius:16px;padding:20px;color:#172033;box-shadow:0 16px 50px #0005';
  panel.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><h2 style="margin:0">मेरे पोस्टर · गैलरी</h2><button type="button" data-action="close" aria-label="गैलरी बंद करें">✕</button></div><p>पोस्टर इस ब्राउज़र में सेव रहते हैं। दूसरे फ़ोन या कंप्यूटर में ले जाने के लिए JSON बैकअप डाउनलोड करें।</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button type="button" data-action="save">अभी का पोस्टर सेव करें</button><button type="button" data-action="export">JSON बैकअप डाउनलोड</button><button type="button" data-action="import">JSON बैकअप खोलें</button><button type="button" data-action="png">PNG डाउनलोड</button><button type="button" data-action="jpg">JPG डाउनलोड</button><button type="button" data-action="pdf">PDF डाउनलोड</button></div><p role="status" aria-live="polite"></p><div data-items style="display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:12px"></div>';
  cover.append(panel);document.body.append(cover);
  const status=panel.querySelector('[role="status"]'),items=panel.querySelector('[data-items]');
  function close(){cover.style.display='none'}
  cover.addEventListener('click',e=>{if(e.target===cover)close()});
  function thumb(saved){const frame=document.createElement('iframe');frame.setAttribute('sandbox','');frame.setAttribute('title','पोस्टर की झलक');frame.style.cssText='width:540px;height:540px;border:0;transform:scale(.34);transform-origin:top left;pointer-events:none';const p=saved.project,w=Math.max(1,Math.min(540,(p.width||1080)/2)),h=Math.max(1,Math.min(540,(p.height||1080)/2));frame.srcdoc=`<style>body{margin:0}#stage{position:relative;overflow:hidden;width:${w}px;height:${h}px;background:${p.bgColor||'#fff'};background-image:${p.bgImage?`url(${JSON.stringify(p.bgImage)})`:'none'};background-size:cover}.element{position:absolute;white-space:pre-wrap;box-sizing:border-box}.handle,.rotateHandle{display:none!important}</style><div id="stage">${p.html||''}</div>`;return frame}
  async function render(){items.replaceChildren();const saved=(await operation('readonly','getAll')).sort((a,b)=>b.id-a.id);
    if(!saved.length){items.textContent='अभी कोई पोस्टर सेव नहीं है।';return}
    for(const entry of saved){const card=document.createElement('div');card.style.cssText='border:1px solid #dbe1ed;border-radius:12px;padding:9px;min-width:0';const preview=document.createElement('div');preview.style.cssText='height:184px;overflow:hidden;background:#f1f5f9;border-radius:8px';preview.append(thumb(entry));const title=document.createElement('strong');title.textContent=entry.name;title.style.cssText='display:block;margin:8px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';const open=document.createElement('button');open.type='button';open.textContent='खोलें';open.onclick=()=>{if(stage.querySelector('.element')&&!confirm('अभी खुला पोस्टर बदल जाएगा। क्या गैलरी वाला पोस्टर खोलें?'))return;if(project.restore(entry.project)){project.save();close()}};const del=document.createElement('button');del.type='button';del.textContent='हटाएँ';del.style.marginLeft='6px';del.onclick=async()=>{if(!confirm('यह सेव किया हुआ पोस्टर गैलरी से हटाएँ?'))return;await operation('readwrite','delete',entry.id);await render()};card.append(preview,title,open,del);items.append(card)}
  }
  async function openGallery(){cover.style.display='flex';try{await render()}catch(error){status.textContent='गैलरी नहीं खुली। JSON बैकअप डाउनलोड करके पोस्टर सुरक्षित रखें।'}}
  async function saveCurrent(){if(!stage.querySelector('.element')){status.textContent='पहले कैनवास पर पोस्टर या कोई एलिमेंट बनाएँ।';return}try{project.save();const poster=project.snapshot(),stamp=new Date();const name=stage.querySelector('.element[data-text]')?.dataset.text?.slice(0,35)||'मेरा पोस्टर';await operation('readwrite','put',{id:stamp.getTime(),name:`${name} · ${stamp.toLocaleString('hi-IN')}`,project:poster});status.textContent='पोस्टर गैलरी में सेव हो गया।';await render()}catch(error){status.textContent='ब्राउज़र में सेव नहीं हुआ। जगह खाली करें या JSON बैकअप डाउनलोड करें।'}}
  function download(data,name,type){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)}
  function pdfFromJpeg(jpeg,width,height){const enc=new TextEncoder(),parts=[],offsets=[0];let size=0;const append=bytes=>{parts.push(bytes);size+=bytes.length};const write=str=>append(enc.encode(str));const obj=(id,body)=>{offsets[id]=size;write(`${id} 0 obj\n${body}\nendobj\n`)};
    write('%PDF-1.4\n');obj(1,'<</Type /Catalog /Pages 2 0 R>>');obj(2,'<</Type /Pages /Kids [3 0 R] /Count 1>>');const w=(width*.75).toFixed(2),h=(height*.75).toFixed(2);obj(3,`<</Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources <</XObject <</Im0 4 0 R>>>> /Contents 5 0 R>>`);offsets[4]=size;write(`4 0 obj\n<</Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length}>>\nstream\n`);append(jpeg);write('\nendstream\nendobj\n');const commands=`q ${w} 0 0 ${h} 0 0 cm /Im0 Do Q\n`;obj(5,`<</Length ${enc.encode(commands).length}>>\nstream\n${commands}endstream`);const start=size;write(`xref\n0 6\n0000000000 65535 f \n`);for(let i=1;i<=5;i++)write(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);write(`trailer\n<</Size 6 /Root 1 0 R>>\nstartxref\n${start}\n%%EOF`);return new Blob(parts,{type:'application/pdf'})}
  async function exportCurrent(format){if(!stage.querySelector('.element')){status.textContent='पहले पोस्टर बनाएँ, फिर डाउनलोड करें।';return}if(!window.APANAM_RENDER_CANVAS){status.textContent='Export तैयार नहीं है। पेज रीफ़्रेश करें।';return}try{status.textContent='फ़ाइल तैयार हो रही है…';const canvas=await window.APANAM_RENDER_CANVAS();if(format==='pdf'){const raw=atob(canvas.toDataURL('image/jpeg',.92).split(',')[1]),jpeg=Uint8Array.from(raw,c=>c.charCodeAt(0));download(pdfFromJpeg(jpeg,canvas.width,canvas.height),'APANAM-poster.pdf','application/pdf')}else{const link=document.createElement('a');link.download=`APANAM-poster.${format}`;link.href=canvas.toDataURL(format==='jpg'?'image/jpeg':'image/png',.92);link.click()}status.textContent=`${format.toUpperCase()} डाउनलोड शुरू हुआ।`}catch(error){status.textContent='डाउनलोड नहीं हो सका। फ़ोटो फिर से चुनकर कोशिश करें।'}}
  panel.addEventListener('click',async e=>{const action=e.target?.dataset?.action;if(action==='close')close();else if(action==='save')await saveCurrent();else if(action==='export')downloadJson?.();else if(action==='import'){close();importJson?.()}else if(['png','jpg','pdf'].includes(action))await exportCurrent(action)});
  saveButton.onclick=async()=>{await openGallery();await saveCurrent()};
  loadButton.onclick=()=>{status.textContent='';openGallery()};
})();
