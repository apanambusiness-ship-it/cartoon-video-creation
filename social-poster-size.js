(()=>{'use strict';
function init(){
 const stage=document.getElementById('stage');if(!stage||document.getElementById('studioPosterSize'))return;
 const platforms=[
  {id:'instagram',name:'Instagram',icon:'◎',color:'#a5287d',formats:[['square','Square',1080,1080],['portrait','Portrait',1080,1350],['story','Story / Reel',1080,1920]]},
  {id:'whatsapp',name:'WhatsApp',icon:'✆',color:'#087d4b',formats:[['status','Status',1080,1920],['post','Poster',1080,1080]]},
  {id:'facebook',name:'Facebook',icon:'f',color:'#1559b7',formats:[['post','Post',1200,630],['story','Story',1080,1920]]},
  {id:'youtube',name:'YouTube',icon:'▶',color:'#c52222',formats:[['thumbnail','Thumbnail',1280,720],['post','Community Post',1080,1080],['shorts','Shorts',1080,1920]]},
  {id:'linkedin',name:'LinkedIn',icon:'in',color:'#0b6695',formats:[['post','Post',1200,627],['square','Square',1080,1080]]},
  {id:'pinterest',name:'Pinterest',icon:'P',color:'#bd1930',formats:[['pin','Pin',1000,1500],['square','Square',1000,1000]]},
  {id:'x',name:'X',icon:'𝕏',color:'#222936',formats:[['post','Landscape Post',1200,675],['square','Square Post',1080,1080]]},
  {id:'telegram',name:'Telegram',icon:'➤',color:'#1686b7',formats:[['post','Channel Post',1080,1080],['story','Story',1080,1920]]},
  {id:'threads',name:'Threads',icon:'@',color:'#38323e',formats:[['post','Portrait Post',1080,1350],['square','Square Post',1080,1080]]}
 ];
 const presets=platforms.flatMap(platform=>platform.formats.map(([id,label,w,h])=>[platform.id+'-'+id,platform.name+' · '+label,w,h]));
 const button=document.createElement('button');button.id='studioPosterSize';button.type='button';button.textContent='Poster Size';button.setAttribute('aria-label','Social platform के अनुसार Poster Size');
 const desktop=document.querySelector('.zoomBar')||document.getElementById('studioSelectionBar')||document.querySelector('.workspace'),mobile=desktop;
 const media=matchMedia('(max-width:900px)');function place(){(media.matches&&mobile?mobile:desktop)?.append(button);}place();media.addEventListener('change',place);
 const dialog=document.createElement('dialog');dialog.id='studioPosterSizeDialog';dialog.setAttribute('aria-labelledby','studioPosterSizeTitle');
 dialog.innerHTML='<form method="dialog"><header><strong id="studioPosterSizeTitle">Social platform · Poster Size</strong><button type="button" aria-label="Poster Size बंद करें">✕</button></header><label>Platform / Format<select id="studioSocialFormat"></select></label><details id="studioSocialMobilePicker"><summary id="studioSocialMobileChoice">Format चुनें</summary><div id="studioSocialMobileOptions"></div></details><div class="poster-size-dimensions"><label>चौड़ाई · pixels<input id="studioSocialWidth" type="number" min="100" max="8192" step="1" required></label><label>ऊँचाई · pixels<input id="studioSocialHeight" type="number" min="100" max="8192" step="1" required></label></div><label>Design कैसे रखें?<select id="studioSocialFit"><option value="fit">पूरा design फिट करें</option><option value="canvas">केवल canvas का size बदलें</option></select></label><p class="poster-size-help">पूरा design फिट करने पर text और photo साथ में छोटे–बड़े होंगे। अलग अनुपात में किनारों पर खाली जगह रह सकती है।</p><p id="studioSocialSizeStatus" role="status" aria-live="polite"></p><button id="studioSocialApply" type="button">Size लागू करें</button></form>';
 document.body.append(dialog);dialog.querySelector('[aria-label="Poster Size बंद करें"]').onclick=()=>dialog.close();const q=id=>dialog.querySelector('#'+id),format=q('studioSocialFormat'),width=q('studioSocialWidth'),height=q('studioSocialHeight'),status=q('studioSocialSizeStatus');
 for(const [id,label,w,h] of presets)format.add(new Option(label+' · '+w+' × '+h,id));format.add(new Option('Custom · अपना size','custom'));
 const picker=q('studioSocialMobilePicker'),choice=q('studioSocialMobileChoice'),options=q('studioSocialMobileOptions');
 const iconFor=(platform)=>{const icon=document.createElement('span');icon.className='studio-social-icon';icon.textContent=platform?.icon||'▣';icon.style.backgroundColor=platform?.color||'#6d28d9';icon.setAttribute('aria-hidden','true');return icon;};
 const platformGroups=new Map(),formatButtons=[];
 for(const platform of platforms){
  const group=document.createElement('details');group.className='studio-social-platform';group.dataset.platform=platform.id;
  const heading=document.createElement('summary');heading.append(iconFor(platform),document.createTextNode(platform.name));group.append(heading);
  const formats=document.createElement('div');formats.className='studio-social-platform-formats';
  for(const [suffix,label,w,h] of platform.formats){
   const item=document.createElement('button');item.type='button';item.dataset.format=platform.id+'-'+suffix;
   item.textContent=label+' · '+w+' × '+h;
   item.onclick=()=>{format.value=item.dataset.format;fill();picker.open=false;choice.focus();};
   formats.append(item);formatButtons.push(item);
  }
  group.append(formats);group.addEventListener('toggle',()=>{if(group.open)for(const other of platformGroups.values())if(other!==group)other.open=false;});
  platformGroups.set(platform.id,group);options.append(group);
 }
 const custom=document.createElement('button');custom.type='button';custom.className='studio-social-custom';custom.dataset.format='custom';custom.textContent='▣  Custom · अपना size';custom.onclick=()=>{format.value='custom';fill();picker.open=false;choice.focus();};options.append(custom);formatButtons.push(custom);
 picker.addEventListener('toggle',()=>{if(picker.open){const selected=platforms.find(platform=>format.value.startsWith(platform.id+'-'));if(selected)platformGroups.get(selected.id).open=true;}});
 function syncPicker(){
  const selected=platforms.find(platform=>format.value.startsWith(platform.id+'-'));
  choice.replaceChildren(iconFor(selected),document.createTextNode(format.selectedOptions[0]?.textContent||'Format चुनें'));
  for(const item of formatButtons)item.setAttribute('aria-pressed',String(item.dataset.format===format.value));
 }
 function fill(){const preset=presets.find(p=>p[0]===format.value);if(preset){width.value=preset[2];height.value=preset[3];}status.textContent='';syncPicker();}
 format.onchange=fill;for(const input of [width,height])input.oninput=()=>{format.value='custom';status.textContent='';syncPicker();};
 function apply(w,h,mode='fit'){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<100||h<100||w>8192||h>8192)throw Error('चौड़ाई और ऊँचाई 100–8192 के बीच पूरी संख्या में भरें।');
  stage.querySelector('.inline-text-input')?.blur();
  const old=window.APANAM_PROJECT.snapshot(),oldW=old.width/2,oldH=old.height/2,newW=w/2,newH=h/2,scale=Math.min(newW/oldW,newH/oldH),dx=(newW-oldW*scale)/2,dy=(newH-oldH*scale)/2;
  window.snap?.();
  if(mode==='fit')for(const element of stage.querySelectorAll(':scope>.element')){
   const css=getComputedStyle(element),left=parseFloat(css.left)||0,top=parseFloat(css.top)||0,ew=element.offsetWidth,eh=element.offsetHeight;
   const sizes={};for(const property of ['fontSize','letterSpacing','paddingTop','paddingRight','paddingBottom','paddingLeft','borderTopWidth','borderRightWidth','borderBottomWidth','borderLeftWidth','borderRadius']){const value=parseFloat(css[property]);if(Number.isFinite(value))sizes[property]=value*scale+'px';}
   Object.assign(element.style,{left:left*scale+dx+'px',top:top*scale+dy+'px',width:ew*scale+'px',height:eh*scale+'px',minWidth:'0',minHeight:'0',...sizes});
  }
  document.getElementById('cw').value=w;document.getElementById('ch').value=h;stage.style.width=newW+'px';stage.style.height=newH+'px';
  const legacy=document.getElementById('size');if(legacy)legacy.value=w+','+h;
  window.APANAM_WORKFLOW?.fit();document.getElementById('zoomFit')?.click();window.APANAM_PROJECT.save();window.APANAM_TEMPLATE_CONTENT?.refresh();
  stage.dispatchEvent(new CustomEvent('apanam-poster-size',{bubbles:true,detail:{width:w,height:h}}));return {width:w,height:h};
 }
 button.onclick=()=>{const current=window.APANAM_PROJECT.snapshot(),preset=presets.find(p=>p[2]===current.width&&p[3]===current.height);format.value=preset?.[0]||'custom';width.value=current.width;height.value=current.height;status.textContent='';syncPicker();picker.open=false;dialog.showModal();};
 q('studioSocialApply').onclick=()=>{try{apply(Number(width.value),Number(height.value),q('studioSocialFit').value);dialog.close();}catch(error){status.textContent=error.message;}};
 window.APANAM_SOCIAL_SIZE={apply,presets,open:()=>button.click()};
 const style=document.createElement('style');style.textContent='#studioPosterSize{flex:0 0 auto;white-space:nowrap;background:#ede9fe;color:#5b21b6;border-color:#c4b5fd}#studioPosterSizeDialog{width:min(430px,calc(100vw - 24px));max-height:calc(100dvh - 40px);padding:16px;border:1px solid #c4b5fd;border-radius:14px;overflow:auto;color:#172033}#studioPosterSizeDialog::backdrop{background:#17203388}#studioPosterSizeDialog header{height:auto;padding:0 0 12px;gap:8px}#studioPosterSizeDialog header button{padding:5px 9px}#studioPosterSizeDialog label{display:block;margin:12px 0;font-size:13px}#studioPosterSizeDialog select,#studioPosterSizeDialog input{display:block;width:100%;min-height:44px;margin-top:6px;padding:8px;border:1px solid #ccd3dd;border-radius:8px;background:#fff;color:#172033;box-sizing:border-box}#studioPosterSizeDialog .poster-size-dimensions{display:grid;grid-template-columns:1fr 1fr;gap:12px}#studioPosterSizeDialog .poster-size-help{font-size:12px;line-height:1.5;color:#526077}#studioSocialApply{width:100%;background:#6d28d9;color:#fff;border:0}#studioSocialSizeStatus{color:#b91c1c;font-size:13px}@media(max-width:900px){.zoomBar #studioPosterSize{font-size:11px;min-width:0;padding:6px 8px}}@media(max-width:900px){#studioPosterSizeDialog #studioSocialFormat{display:none!important}#studioSocialMobilePicker{display:block;border:1px solid #c9b8e1;border-radius:10px;background:#f7f3fc;margin:4px 0 10px}#studioSocialMobileChoice{cursor:pointer;list-style:none;padding:10px 12px;font-size:14px;line-height:1.3;font-weight:700;color:#43216c}#studioSocialMobileChoice::-webkit-details-marker{display:none}#studioSocialMobileChoice:after{content:" ▾";float:right}#studioSocialMobilePicker[open] #studioSocialMobileChoice:after{content:" ▴"}#studioSocialMobileOptions{display:grid;gap:6px;padding:6px;max-height:min(52dvh,360px);overflow-y:auto}#studioSocialMobileOptions .studio-social-platform{border:1px solid #d8c9e9;border-radius:9px;background:#fff;overflow:visible}#studioSocialMobileOptions .studio-social-platform>summary{display:flex;align-items:center;gap:9px;min-height:46px;padding:5px 10px;cursor:pointer;list-style:none;color:#302047;font-size:14px;font-weight:700}#studioSocialMobileOptions .studio-social-platform>summary::-webkit-details-marker{display:none}#studioSocialMobileOptions .studio-social-platform>summary:after{content:"⌄";margin-left:auto;color:#6b557d}#studioSocialMobileOptions .studio-social-platform[open]>summary:after{content:"⌃"}#studioSocialMobileOptions .studio-social-platform-formats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:0 7px 7px}#studioSocialMobileOptions button{min-width:0;min-height:44px;padding:6px 8px;border:1px solid #d8c9e9;border-radius:8px;background:#fff;color:#392461;text-align:left;font-size:12px;line-height:1.3;font-weight:600;overflow-wrap:anywhere}#studioSocialMobileOptions .studio-social-custom{width:100%;min-height:44px}#studioSocialMobileOptions button[aria-pressed=true]{background:#5b21b6;color:#fff;border-color:#4b168f}#studioSocialMobilePicker .studio-social-icon{display:inline-grid;place-items:center;flex:0 0 27px;width:27px;height:27px;border-radius:8px;color:#fff;font-size:17px;font-weight:800;line-height:1}#studioSocialMobileChoice{display:flex;align-items:center;gap:8px;padding-right:27px;position:relative}#studioSocialMobileChoice:after{position:absolute;right:10px;top:50%;transform:translateY(-50%)}#studioSocialMobilePicker :is(summary,button):focus-visible{outline:3px solid #a855f7;outline-offset:2px}}@media(min-width:901px){#studioSocialMobilePicker{display:none}}';document.head.append(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
