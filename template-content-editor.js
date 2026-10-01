(()=>{
  const stage=document.getElementById('stage');if(!stage)return;
  const panel=document.createElement('details');panel.id='templateContentEditor';panel.open=true;
  panel.innerHTML='<summary>Template का text / photo बदलें</summary><p>Editable JSON की हर layer नीचे बदलें। PNG/JPG के पुराने text/photo को मूल image से मिटा सकते हैं या उसी हिस्से में नया text/photo सेव कर सकते हैं। मूल image से छिपी layers अपने आप वापस नहीं मिलतीं।</p><div id="templateLayerFields"></div><hr><label>मिटाए गए हिस्से का रंग <input id="templatePatchColor" type="color" value="#ffffff"></label><label>Image के अंदर नया text<textarea id="templateRasterText" placeholder="बदला हुआ text लिखें"></textarea></label><label>Text रंग<input id="templateRasterTextColor" type="color" value="#111111"></label><label>Text size<input id="templateRasterTextSize" type="number" min="8" max="500" value="32"></label><label>Image के अंदर नई photo<input id="templateRasterPhoto" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label><div class="row"><button type="button" id="templateRasterTextEdit">Image के अंदर Text Edit</button><button type="button" id="templateRasterPhotoEdit">Image के अंदर Photo Edit</button></div><button type="button" id="templateEraseRegion">मूल image से text / photo मिटाएँ</button><label>मिटाने के बाद<select id="templateEraseFill"><option value="color">चुना रंग भरें</option><option value="transparent">Transparent रखें</option></select></label><p>Image के pixels मिटेंगे। पीछे छिपा हुआ पुराना background वापस नहीं मिल सकता।</p><details><summary>अलग editable layer जोड़ें</summary><div class="row"><button type="button" id="templateTextRegion">Text का हिस्सा चुनें</button><button type="button" id="templatePhotoRegion">Photo का हिस्सा चुनें</button></div></details><button type="button" id="templateDetectText">Image का text पहचानें (OCR)</button><button type="button" id="templateCancelRegion" hidden>चुनना रद्द करें</button><p role="status" aria-live="polite"></p>';
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
      label.append(input);const select=document.createElement('button');select.type='button';select.textContent='Canvas में चुनें';select.onclick=()=>mark(el);const remove=document.createElement('button');remove.type='button';remove.className='danger';remove.textContent='इस '+(img?'photo':'text')+' को Delete करें';remove.onclick=()=>{if(!el.isConnected)return;window.snap?.();el.remove();document.getElementById('clearSelection')?.click();save();render();status.textContent='Layer Delete हो गई। Undo से वापस ला सकते हैं।';};row.append(label,select,remove);list.append(row);
    }
    if(!count){const hint=document.createElement('p');hint.textContent='पहले Poster / Templates से template खोलें या poster upload करें।';list.append(hint);}
  }
  async function erase(rect,kind){
    try{
      const stageBox=stage.getBoundingClientRect(),scaleX=stageBox.width/stage.offsetWidth,scaleY=stageBox.height/stage.offsetHeight;
      const box={left:stageBox.left+rect.x*scaleX,top:stageBox.top+rect.y*scaleY,right:stageBox.left+(rect.x+rect.w)*scaleX,bottom:stageBox.top+(rect.y+rect.h)*scaleY};
      const candidates=[...stage.querySelectorAll('.element')].filter(el=>el.querySelector('img')).map(el=>{const img=el.querySelector('img'),bounds=img.getBoundingClientRect();return{el,img,bounds,area:Math.max(0,Math.min(box.right,bounds.right)-Math.max(box.left,bounds.left))*Math.max(0,Math.min(box.bottom,bounds.bottom)-Math.max(box.top,bounds.top))};}).filter(item=>item.area>0).sort((a,b)=>Number(b.el.classList.contains('selected'))-Number(a.el.classList.contains('selected'))||(Number(b.el.style.zIndex)||0)-(Number(a.el.style.zIndex)||0));
      if(!candidates.length)throw Error('चुने हुए हिस्से में image नहीं है। अलग text layer को उसके Delete बटन से हटाएँ।');
      const {el,img,bounds}=candidates[0],matrix=new DOMMatrix(getComputedStyle(el).transform);
      if(Math.abs(matrix.b)>.001||Math.abs(matrix.c)>.001||matrix.a<0||matrix.d<0)throw Error('इस image का rotation/flip पहले हटाएँ, फिर हिस्सा मिटाएँ।');
      const original=img.src;await img.decode();if(!el.isConnected||img.src!==original)throw Error('Image बदल चुकी है। दोबारा हिस्सा चुनें।');
      const width=img.naturalWidth,height=img.naturalHeight,fit=getComputedStyle(img).objectFit;let dw=bounds.width,dh=bounds.height;
      if(fit==='contain'||fit==='cover'){const ratio=(fit==='cover'?Math.max:Math.min)(bounds.width/width,bounds.height/height);dw=width*ratio;dh=height*ratio;}
      const left=bounds.left+(bounds.width-dw)/2,top=bounds.top+(bounds.height-dh)/2;
      const x=Math.max(0,Math.floor((Math.max(box.left,bounds.left,left)-left)*width/dw)),y=Math.max(0,Math.floor((Math.max(box.top,bounds.top,top)-top)*height/dh));
      const right=Math.min(width,Math.ceil((Math.min(box.right,bounds.right,left+dw)-left)*width/dw)),bottom=Math.min(height,Math.ceil((Math.min(box.bottom,bounds.bottom,top+dh)-top)*height/dh));
      if(right<=x||bottom<=y)throw Error('Image के खाली margin की जगह text/photo वाला हिस्सा चुनें।');
      const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d');context.drawImage(img,0,0);context.clearRect(x,y,right-x,bottom-y);
      if(panel.querySelector('#templateEraseFill').value==='color'){context.fillStyle=panel.querySelector('#templatePatchColor').value;context.fillRect(x,y,right-x,bottom-y);}
      if(kind==='editText'){
        const value=panel.querySelector('#templateRasterText').value;if(!value.trim())throw Error('पहले नया text लिखें, फिर उसका हिस्सा चुनें।');
        const size=Math.max(8,Math.min(500,Number(panel.querySelector('#templateRasterTextSize').value)||32));context.fillStyle=panel.querySelector('#templateRasterTextColor').value;context.font=size+'px Arial, sans-serif';context.textBaseline='top';context.save();context.beginPath();context.rect(x,y,right-x,bottom-y);context.clip();
        const lines=[];for(const paragraph of value.split('\n')){let line='';for(const char of [...paragraph]){if(line&&context.measureText(line+char).width>right-x-4){lines.push(line);line=char}else line+=char;}lines.push(line);}lines.forEach((line,index)=>context.fillText(line,x+2,y+2+index*size*1.2));context.restore();
      }
      if(kind==='editPhoto'){
        const src=await photo(panel.querySelector('#templateRasterPhoto').files[0]),replacement=new Image();replacement.src=src;await replacement.decode();const ratio=Math.max((right-x)/replacement.naturalWidth,(bottom-y)/replacement.naturalHeight),dw=replacement.naturalWidth*ratio,dh=replacement.naturalHeight*ratio;context.save();context.beginPath();context.rect(x,y,right-x,bottom-y);context.clip();context.drawImage(replacement,x+(right-x-dw)/2,y+(bottom-y-dh)/2,dw,dh);context.restore();
      }
      if(!el.isConnected||img.src!==original)throw Error('Image बदल चुकी है। दोबारा हिस्सा चुनें।');
      const output=canvas.toDataURL('image/png');window.snap?.();img.src=output;save();render();status.textContent=kind==='erase'?'चुना text/photo मूल image के pixels से मिट गया। कोई नई cover layer नहीं बनी। Undo से वापस ला सकते हैं।':'चुना text/photo उसी मूल image में Edit हो गया। Save किया गया; Undo से वापस ला सकते हैं।';
    }catch(error){status.textContent=error.name==='SecurityError'?'इस remote image को पहले download करके upload करें, फिर मिटाएँ।':error.message;}
  }
  function cancel(){document.body.classList.remove('template-selecting');region?.remove();region=null;panel.querySelector('#templateCancelRegion').hidden=true;}
  function start(kind){
    cancel();if(!stage.querySelector('.element')){status.textContent='पहले template खोलें।';return;}
    document.body.classList.add('template-selecting');region=document.createElement('div');region.className='template-region-selector';const area=document.createElement('div');area.className='template-region-box';region.append(area);stage.append(region);
    panel.querySelector('#templateCancelRegion').hidden=false;status.textContent=['erase','editText','editPhoto'].includes(kind)?'जिस image का हिस्सा मिटाना है उसे पहले चुनें, फिर उसके text/photo के चारों ओर box बनाएँ।':'Canvas पर पुराने '+(kind==='text'?'text':'photo')+' के चारों ओर drag करके box बनाएँ।';
    let begin=null,rect=null;
    const point=e=>{const b=stage.getBoundingClientRect();return{x:Math.max(0,Math.min(stage.offsetWidth,(e.clientX-b.left)*stage.offsetWidth/b.width)),y:Math.max(0,Math.min(stage.offsetHeight,(e.clientY-b.top)*stage.offsetHeight/b.height))}};
    region.onpointerdown=e=>{const b=stage.getBoundingClientRect();if(e.button!==0||e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)return;e.preventDefault();e.stopImmediatePropagation();begin=point(e);};
    region.onpointermove=e=>{if(!begin)return;e.preventDefault();e.stopImmediatePropagation();const end=point(e);rect={x:Math.min(begin.x,end.x),y:Math.min(begin.y,end.y),w:Math.abs(end.x-begin.x),h:Math.abs(end.y-begin.y)};Object.assign(area.style,{left:rect.x+'px',top:rect.y+'px',width:rect.w+'px',height:rect.h+'px'});};
    region.onpointerup=e=>{if(!begin)return;e.preventDefault();e.stopImmediatePropagation();begin=null;if(!rect||rect.w<10||rect.h<10){status.textContent='थोड़ा बड़ा हिस्सा चुनें।';return;}
      if(['erase','editText','editPhoto'].includes(kind)){const selectedRect={...rect};cancel();erase(selectedRect,kind);return;}
      const el=document.createElement('div');el.className='element'+(kind==='text'?' text':'');el.dataset.rotate='0';el.dataset.locked='0';el.dataset.templateReplacement='1';
      const z=Math.max(1,...[...stage.querySelectorAll('.element')].map(n=>Number(n.style.zIndex)||1))+1;
      Object.assign(el.style,{position:'absolute',left:rect.x+'px',top:rect.y+'px',width:rect.w+'px',height:rect.h+'px',backgroundColor:panel.querySelector('#templatePatchColor').value,zIndex:String(z),overflow:'visible',boxSizing:'border-box',color:'#111111',fontSize:Math.max(12,Math.min(42,rect.h*.6))+'px',whiteSpace:'pre-wrap'});
      if(kind==='text'){el.dataset.text='अपना text लिखें';el.textContent=el.dataset.text;}
      else{const img=document.createElement('img');img.alt='Replacement photo';img.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=';img.style.cssText='width:100%;height:100%;object-fit:contain';el.append(img);}
      cancel();stage.append(el);window.APANAM_EDITOR_WIRE?.(el);mark(el);save();render();status.textContent=kind==='text'?'नए text की layer बनी। ऊपर Text field में लिखें।':'नई photo की layer बनी। ऊपर Photo field से image चुनें।';const fields=[...list.querySelectorAll(kind==='text'?'textarea':'input[type=file]')];fields.at(-1)?.focus();
    };
    stage.scrollIntoView({block:'center',behavior:'instant'});
  }
  panel.querySelector('#templateRasterTextEdit').onclick=()=>start('editText');panel.querySelector('#templateRasterPhotoEdit').onclick=()=>start('editPhoto');panel.querySelector('#templateEraseRegion').onclick=()=>start('erase');panel.querySelector('#templateTextRegion').onclick=()=>start('text');panel.querySelector('#templatePhotoRegion').onclick=()=>start('photo');panel.querySelector('#templateCancelRegion').onclick=cancel;
  panel.querySelector('#templateDetectText').onclick=()=>{const button=document.getElementById('autoMakeEditable');if(!button){status.textContent='Text पहचानने का tool अभी उपलब्ध नहीं है।';return;}const images=[...stage.querySelectorAll('.element')].filter(e=>e.querySelector('img'));const chosen=images.find(e=>e.classList.contains('selected'))||images[0];if(!chosen){status.textContent='पहले image वाला template खोलें।';return;}mark(chosen);button.click();status.textContent='Text पहचानने के लिए internet चाहिए। नतीजा image की स्पष्टता पर निर्भर है; पहचान के बाद नीचे text fields दिखेंगे।';};
  let timer;new MutationObserver(records=>{if(records.every(r=>r.target.closest?.('.template-region-selector')))return;if(list.contains(document.activeElement))return;clearTimeout(timer);timer=setTimeout(render,120);}).observe(stage,{childList:true,subtree:true});
  window.APANAM_TEMPLATE_CONTENT={refresh:()=>{cancel();document.querySelector('.organizer-nav [data-group="Templates"]')?.click();panel.open=true;render();panel.scrollIntoView({block:'nearest'});}};
  function directText(){const value=prompt('Image में पुराने text की जगह नया text लिखें:');if(value===null)return;if(!value.trim()){status.textContent='नया text लिखें।';return;}panel.querySelector('#templateRasterText').value=value;start('editText');}
  function directPhoto(){const input=panel.querySelector('#templateRasterPhoto');input.value='';input.onchange=()=>{if(input.files.length)start('editPhoto');input.onchange=null;};input.click();}
  const direct=document.createElement('div');direct.id='templateCanvasActions';direct.innerHTML='<strong>PNG/JPG के अंदर:</strong><button type="button" id="templateCanvasTextEdit">Text बदलें</button><button type="button" id="templateCanvasPhotoEdit">Photo बदलें</button><button type="button" id="templateCanvasDelete">हिस्सा Delete</button><span id="templateCanvasHint" role="status" aria-live="polite">बटन दबाएँ, फिर image के पुराने हिस्से पर box बनाएँ।</span>';
  const toolbar=document.querySelector('.zoomBar');if(toolbar)toolbar.after(direct);else stage.parentElement.before(direct);
  direct.querySelector('#templateCanvasTextEdit').onclick=directText;direct.querySelector('#templateCanvasPhotoEdit').onclick=directPhoto;direct.querySelector('#templateCanvasDelete').onclick=()=>start('erase');
  stage.addEventListener('dblclick',e=>{if(region)return;const el=e.target.closest('.element');if(el?.querySelector('img')){mark(el);if(window.APANAM_IMAGE_EDIT)window.APANAM_IMAGE_EDIT.detect(el);else directText();}});
  new MutationObserver(()=>{direct.querySelector('#templateCanvasHint').textContent=status.textContent||'बटन दबाएँ, फिर image के पुराने हिस्से पर box बनाएँ।';}).observe(status,{childList:true,subtree:true,characterData:true});
  for(const type of ['pointerdown','pointermove','pointerup'])window.addEventListener(type,e=>region?.['on'+type]?.(e),{capture:true});
  for(const id of ['undo','redo'])document.getElementById(id)?.addEventListener('click',()=>{save();render()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')cancel()});render();
})();
