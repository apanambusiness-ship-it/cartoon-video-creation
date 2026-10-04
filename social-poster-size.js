(()=>{'use strict';
function init(){
 const stage=document.getElementById('stage');if(!stage||document.getElementById('studioPosterSize'))return;
 const presets=[
  ['instagram-square','Instagram · Square',1080,1080],
  ['instagram-portrait','Instagram · Portrait',1080,1350],
  ['instagram-story','Instagram · Story / Reel',1080,1920],
  ['whatsapp-status','WhatsApp · Status',1080,1920],
  ['whatsapp-post','WhatsApp · Poster',1080,1080],
  ['facebook-post','Facebook · Post',1200,630],
  ['facebook-story','Facebook · Story',1080,1920],
  ['youtube-thumbnail','YouTube · Thumbnail',1280,720],
  ['youtube-post','YouTube · Community Post',1080,1080],
  ['linkedin-post','LinkedIn · Post',1200,627]
 ];
 const button=document.createElement('button');button.id='studioPosterSize';button.type='button';button.textContent='Poster Size';button.setAttribute('aria-label','Social platform के अनुसार Poster Size');
 const desktop=document.querySelector('.zoomBar')||document.getElementById('studioSelectionBar')||document.querySelector('.workspace'),mobile=desktop;
 const media=matchMedia('(max-width:900px)');function place(){(media.matches&&mobile?mobile:desktop)?.append(button);}place();media.addEventListener('change',place);
 const dialog=document.createElement('dialog');dialog.id='studioPosterSizeDialog';dialog.setAttribute('aria-labelledby','studioPosterSizeTitle');
 dialog.innerHTML='<form method="dialog"><header><strong id="studioPosterSizeTitle">Social platform · Poster Size</strong><button type="submit" aria-label="Poster Size बंद करें">✕</button></header><label>Platform / Format<select id="studioSocialFormat"></select></label><div class="poster-size-dimensions"><label>चौड़ाई · pixels<input id="studioSocialWidth" type="number" min="100" max="8192" step="1" required></label><label>ऊँचाई · pixels<input id="studioSocialHeight" type="number" min="100" max="8192" step="1" required></label></div><label>Design कैसे रखें?<select id="studioSocialFit"><option value="fit">पूरा design फिट करें</option><option value="canvas">केवल canvas का size बदलें</option></select></label><p class="poster-size-help">पूरा design फिट करने पर text और photo साथ में छोटे–बड़े होंगे। अलग अनुपात में किनारों पर खाली जगह रह सकती है।</p><p id="studioSocialSizeStatus" role="status" aria-live="polite"></p><button id="studioSocialApply" type="button">Size लागू करें</button></form>';
 document.body.append(dialog);const q=id=>dialog.querySelector('#'+id),format=q('studioSocialFormat'),width=q('studioSocialWidth'),height=q('studioSocialHeight'),status=q('studioSocialSizeStatus');
 for(const [id,label,w,h] of presets)format.add(new Option(label+' · '+w+' × '+h,id));format.add(new Option('Custom · अपना size','custom'));
 function fill(){const preset=presets.find(p=>p[0]===format.value);if(preset){width.value=preset[2];height.value=preset[3];}status.textContent='';}
 format.onchange=fill;for(const input of [width,height])input.oninput=()=>{format.value='custom';status.textContent='';};
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
 button.onclick=()=>{const current=window.APANAM_PROJECT.snapshot(),preset=presets.find(p=>p[2]===current.width&&p[3]===current.height);format.value=preset?.[0]||'custom';width.value=current.width;height.value=current.height;status.textContent='';dialog.showModal();};
 q('studioSocialApply').onclick=()=>{try{apply(Number(width.value),Number(height.value),q('studioSocialFit').value);dialog.close();}catch(error){status.textContent=error.message;}};
 window.APANAM_SOCIAL_SIZE={apply,presets,open:()=>button.click()};
 const style=document.createElement('style');style.textContent='#studioPosterSize{flex:0 0 auto;white-space:nowrap;background:#ede9fe;color:#5b21b6;border-color:#c4b5fd}#studioPosterSizeDialog{width:min(430px,calc(100vw - 24px));max-height:calc(100dvh - 40px);padding:16px;border:1px solid #c4b5fd;border-radius:14px;overflow:auto;color:#172033}#studioPosterSizeDialog::backdrop{background:#17203388}#studioPosterSizeDialog header{height:auto;padding:0 0 12px;gap:8px}#studioPosterSizeDialog header button{padding:5px 9px}#studioPosterSizeDialog label{display:block;margin:12px 0;font-size:13px}#studioPosterSizeDialog select,#studioPosterSizeDialog input{display:block;width:100%;min-height:44px;margin-top:6px;padding:8px;border:1px solid #ccd3dd;border-radius:8px;background:#fff;color:#172033;box-sizing:border-box}#studioPosterSizeDialog .poster-size-dimensions{display:grid;grid-template-columns:1fr 1fr;gap:12px}#studioPosterSizeDialog .poster-size-help{font-size:12px;line-height:1.5;color:#526077}#studioSocialApply{width:100%;background:#6d28d9;color:#fff;border:0}#studioSocialSizeStatus{color:#b91c1c;font-size:13px}@media(max-width:900px){.zoomBar #studioPosterSize{font-size:11px;min-width:0;padding:6px 8px}}';document.head.append(style);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
