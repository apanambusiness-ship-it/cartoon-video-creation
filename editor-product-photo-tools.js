(()=>{
  const $=s=>document.querySelector(s),stage=$('#stage');
  if(!stage)return;
  function chosen(){return [...stage.querySelectorAll('.element.selected')].filter(el=>el.dataset.locked!=='1'&&(el.tagName==='IMG'||el.querySelector('img')))}
  function look(brightness,contrast,saturation){
    const elements=chosen();
    if(!elements.length){alert('पहले product photo select करें।');return}
    for(const element of elements){
      Object.assign(element.dataset,{brightness,contrast,saturation});
      const image=element.tagName==='IMG'?element:element.querySelector('img');
      const grayscale=Number(element.dataset.grayscale||0),blur=Number(element.dataset.blur||0);
      image.style.filter=`brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px)`;
    }
    for(const [id,value] of Object.entries({brightness,contrast,saturation})){const input=$('#'+id);if(input)input.value=value}
    window.APANAM_PROJECT?.save?.();
  }
  const tools={clean:()=>look(106,106,104),vivid:()=>look(103,110,118),soft:()=>look(108,96,94),original:()=>look(100,100,100)};
  const right=$('aside.right');if(!right)return;
  const box=document.createElement('div');
  box.innerHTML='<h3>Product Photo Quick Look</h3><p class="small">फ़ोटो का look बदलें। नीचे brightness, contrast और saturation से आगे सुधारें।</p><button id="eppClean">✨ Clean Marketplace</button><button id="eppVivid">◉ Vivid Product</button><button id="eppSoft">☁ Soft Beauty</button><button id="eppOriginal">↶ मूल रूप</button>';
  right.insertBefore(box,right.firstChild);
  for(const [key,id] of Object.entries({clean:'eppClean',vivid:'eppVivid',soft:'eppSoft',original:'eppOriginal'}))$('#'+id).onclick=tools[key];
  window.APANAM_PRODUCT_PHOTO_TOOLS=tools;
  if(!document.querySelector('script[data-apanam-text-quick]')){const script=document.createElement('script');script.src='editor-text-quick-tools.js';script.dataset.apanamTextQuick='1';document.body.appendChild(script)}
})();
