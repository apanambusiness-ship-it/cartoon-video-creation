(()=>{
  const stage=document.getElementById('stage');if(!stage)return;
  const panel=document.createElement('details');panel.id='templateContentEditor';panel.open=true;
  panel.innerHTML='<summary>Template का text / photo बदलें</summary><p>Editable JSON की हर layer नीचे बदलें। PNG/JPG में पुराने text या photo पर नया content लगाने के लिए उसका हिस्सा चुनें। मूल image से छिपी layers अपने आप वापस नहीं मिलतीं।</p><div id="templateLayerFields"></div><hr><label>पुराने हिस्से को ढकने का रंग <input id="templatePatchColor" type="color" value="#ffffff"></label><div class="row"><button type="button" id="templateTextRegion">Text का हिस्सा चुनें</button><button type="button" id="templatePhotoRegion">Photo का हिस्सा चुनें</button></div><button type="button" id="templateDetectText">Image का text पहचानें (OCR)</button><button type="button" id="templateCancelRegion" hidden>चुनना रद्द करें</button><p role="status" aria-live="polite"></p>';
  (document.querySelector('.organizer-panel[data-group="Templates"]')||document.querySelector('main>aside')).prepend(panel);
  const list=panel.querySelector('#templateLayerFields'),status=panel.querySelector('[role=status]');let region=null;
  function save(){window.APANAM_PROJECT?.save();}
  function mark(el){el.dataset.locked='0';el.classList.remove('locked');el.style.visibility='visible';el.dataset.hidden='0';el.click();}
  function text(el,value){el.dataset.text=value;for(const node of [...el.childNodes])if(node.nodeType===Node.TEXT_NODE||(node.nodeType===Node.ELEMENT_NODE&&!node.matches('.handle,.rotateHandle,.resize')))node.remove();el.prepend(document.createTextNode(value));save();}
  async function photo(file){if(!file||!/^image\/(png|jpeg|webp|gif)$/.test(file.type))throw Error('PNG, JPG, WebP या GIF photo चुनें।');if(file.size>20*1024*1024)throw Error('Photo 20 MB से छोटी रखें।');const project=await APANAM_CATALOG.imageProject(file),box=document.createElement('template');box.innerHTML=project.html;return box.content.querySelector('img').src;}
  function render(){
    list.replaceChildren();let count=0;
    for(const el of stage.querySelectorAll('.element')){
      const img=el.querySelector('img'),isText=el.classList.contains('text')||el.hasAttribute('data-text')||el.dataset.type==='text'||el.dataset.kind==='text';if(!img&&!isText)continue;
      count++;const row=document.createElement('section');row.className='template-layer-field';const label=document.createElement('label');label.textContent=`${count}. ${img?'Photo':'Text'}`;
      const input=document.createElement(img?'input':'textarea');input.setAttribute('aria-label',`Template ${img?'photo':'text'} ${count}`);
      if(img){input.type='file';input.accept='image/png,image/jpeg,image/webp,image/gif';input.onchange=async()=>{try{const src=await photo(input.files[0]);if(!el.isConnected)throw Error('यह layer बदल चुकी है।');img.src=src;mark(el);save();status.textContent='Photo बदल गया।';}catch(e){status.textContent=e.message}input.value=''};}
      else{input.value=el.dataset.text??[...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('');input.oninput=()=>{if(el.isConnected)text(el,input.value)};}
      label.append(input);const select=document.createElement('button');select.type='button';select.textContent='Canvas में चुनें';select.onclick=()=>mark(el);row.append(label,select);list.append(row);
    }
    if(!count){const hint=document.createElement('p');hint.textContent='पहले Poster / Templates से template खोलें या poster upload करें।';list.append(hint);}
  }
  function cancel(){document.body.classList.remove('template-selecting');region?.remove();region=null;panel.querySelector('#templateCancelRegion').hidden=true;}
  function start(kind){
    cancel();if(!stage.querySelector('.element')){status.textContent='पहले template खोलें।';return;}
    document.body.classList.add('template-selecting');region=document.createElement('div');region.className='template-region-selector';const area=document.createElement('div');area.className='template-region-box';region.append(area);stage.append(region);
    panel.querySelector('#templateCancelRegion').hidden=false;status.textContent='Canvas पर पुराने '+(kind==='text'?'text':'photo')+' के चारों ओर drag करके box बनाएँ।';
    let begin=null,rect=null;
    const point=e=>{const b=stage.getBoundingClientRect();return{x:Math.max(0,Math.min(stage.offsetWidth,(e.clientX-b.left)*stage.offsetWidth/b.width)),y:Math.max(0,Math.min(stage.offsetHeight,(e.clientY-b.top)*stage.offsetHeight/b.height))}};
    region.onpointerdown=e=>{const b=stage.getBoundingClientRect();if(e.button!==0||e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)return;e.preventDefault();e.stopImmediatePropagation();begin=point(e);};
    region.onpointermove=e=>{if(!begin)return;e.preventDefault();e.stopImmediatePropagation();const end=point(e);rect={x:Math.min(begin.x,end.x),y:Math.min(begin.y,end.y),w:Math.abs(end.x-begin.x),h:Math.abs(end.y-begin.y)};Object.assign(area.style,{left:rect.x+'px',top:rect.y+'px',width:rect.w+'px',height:rect.h+'px'});};
    region.onpointerup=e=>{if(!begin)return;e.preventDefault();e.stopImmediatePropagation();begin=null;if(!rect||rect.w<10||rect.h<10){status.textContent='थोड़ा बड़ा हिस्सा चुनें।';return;}
      const el=document.createElement('div');el.className='element'+(kind==='text'?' text':'');el.dataset.rotate='0';el.dataset.locked='0';el.dataset.templateReplacement='1';
      const z=Math.max(1,...[...stage.querySelectorAll('.element')].map(n=>Number(n.style.zIndex)||1))+1;
      Object.assign(el.style,{position:'absolute',left:rect.x+'px',top:rect.y+'px',width:rect.w+'px',height:rect.h+'px',backgroundColor:panel.querySelector('#templatePatchColor').value,zIndex:String(z),overflow:'visible',boxSizing:'border-box',color:'#111111',fontSize:Math.max(12,Math.min(42,rect.h*.6))+'px',whiteSpace:'pre-wrap'});
      if(kind==='text'){el.dataset.text='अपना text लिखें';el.textContent=el.dataset.text;}
      else{const img=document.createElement('img');img.alt='Replacement photo';img.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';img.style.cssText='width:100%;height:100%;object-fit:contain';el.append(img);}
      cancel();stage.append(el);window.APANAM_EDITOR_WIRE?.(el);mark(el);save();render();status.textContent=kind==='text'?'नए text की layer बनी। ऊपर Text field में लिखें।':'नई photo की layer बनी। ऊपर Photo field से image चुनें।';const fields=[...list.querySelectorAll(kind==='text'?'textarea':'input[type=file]')];fields.at(-1)?.focus();
    };
    stage.scrollIntoView({block:'center',behavior:'instant'});
  }
  panel.querySelector('#templateTextRegion').onclick=()=>start('text');panel.querySelector('#templatePhotoRegion').onclick=()=>start('photo');panel.querySelector('#templateCancelRegion').onclick=cancel;
  panel.querySelector('#templateDetectText').onclick=()=>{const button=document.getElementById('autoMakeEditable');if(!button){status.textContent='Text पहचानने का tool अभी उपलब्ध नहीं है।';return;}const images=[...stage.querySelectorAll('.element')].filter(e=>e.querySelector('img'));const chosen=images.find(e=>e.classList.contains('selected'))||images[0];if(!chosen){status.textContent='पहले image वाला template खोलें।';return;}mark(chosen);button.click();status.textContent='Text पहचानने के लिए internet चाहिए। नतीजा image की स्पष्टता पर निर्भर है; पहचान के बाद नीचे text fields दिखेंगे।';};
  let timer;new MutationObserver(records=>{if(records.every(r=>r.target.closest?.('.template-region-selector')))return;if(list.contains(document.activeElement))return;clearTimeout(timer);timer=setTimeout(render,120);}).observe(stage,{childList:true,subtree:true});
  window.APANAM_TEMPLATE_CONTENT={refresh:()=>{cancel();document.querySelector('.organizer-nav [data-group="Templates"]')?.click();panel.open=true;render();panel.scrollIntoView({block:'nearest'});}};
  for(const type of ['pointerdown','pointermove','pointerup'])window.addEventListener(type,e=>region?.['on'+type]?.(e),{capture:true});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')cancel()});render();
})();
