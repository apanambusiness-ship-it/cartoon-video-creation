(()=>{
  if(document.getElementById('apanamCreatorHubButton'))return;
  const header=document.querySelector('body>header');
  if(!header)return;
  const button=document.createElement('button');
  button.id='apanamCreatorHubButton';button.type='button';button.textContent='✦ Creator';button.title='सभी क्रिएटिव टूल्स';
  const actions=header.querySelector('.actions');(actions||header).prepend(button);
  const overlay=document.createElement('div');overlay.className='apanam-hub-overlay';overlay.hidden=true;
  overlay.innerHTML=`<section class="apanam-hub" role="dialog" aria-modal="true" aria-labelledby="apanam-hub-title"><div class="apanam-hub-head"><div><small>APANAM AI CREATIVE STUDIO</small><h2 id="apanam-hub-title">क्या बनाना है?</h2></div><button type="button" data-hub="close" aria-label="बंद करें">✕</button></div><div class="apanam-hub-grid"><button type="button" data-hub="poster"><span>🎨</span><strong>पोस्टर बनाएँ</strong><small>टेम्पलेट, टेक्स्ट, फ़ोटो और PDF</small></button><button type="button" data-hub="product"><span>🛍️</span><strong>प्रोडक्ट डिज़ाइन</strong><small>कीमत, ऑफ़र और लिस्टिंग फ़ोटो</small></button><a href="cartoon-video.html"><span>🎬</span><strong>कार्टून वीडियो</strong><small>सीन, प्रीव्यू और WebM डाउनलोड</small></a><button type="button" data-hub="gallery"><span>🗂️</span><strong>मेरे पोस्टर</strong><small>सेव किए पोस्टर और JSON बैकअप</small></button><button type="button" data-hub="posterVideo"><span>🎞️</span><strong>पोस्टर से वीडियो</strong><small>अभी खुले पोस्टर को नए वीडियो सीन में भेजें</small></button></div><p data-hub-status>पोस्टर और प्रोडक्ट डिज़ाइन इसी एडिटर में खुलते हैं। वीडियो अलग पेज पर खुलेगा।</p></section>`;
  document.body.append(overlay);
  const close=()=>{overlay.hidden=true;button.focus()};
  button.onclick=()=>{overlay.hidden=false;overlay.querySelector('[data-hub="close"]').focus()};
  overlay.addEventListener('click',async event=>{
    if(event.target===overlay){close();return}
    const target=event.target.closest('[data-hub]');if(!target)return;
    if(target.dataset.hub==='close')close();
    if(target.dataset.hub==='gallery'){close();document.getElementById('loadProject')?.click()}
    if(target.dataset.hub==='posterVideo'){
      const status=overlay.querySelector('[data-hub-status]');
      if(!document.querySelector('#stage .element')){status.textContent='पहले कैनवास पर पोस्टर बनाएँ या खोलें।';return}
      if(!window.APANAM_RENDER_CANVAS){status.textContent='पोस्टर तैयार नहीं है। पेज दोबारा खोलें।';return}
      target.disabled=true;status.textContent='पोस्टर वीडियो के लिए तैयार हो रहा है…';
      try{const source=await window.APANAM_RENDER_CANVAS(),scale=Math.min(1,960/Math.max(source.width,source.height)),output=document.createElement('canvas');output.width=Math.max(1,Math.round(source.width*scale));output.height=Math.max(1,Math.round(source.height*scale));output.getContext('2d').drawImage(source,0,0,output.width,output.height);const image=output.toDataURL('image/jpeg',.75);sessionStorage.setItem('apanam-poster-to-video',image);window.location.href='cartoon-video.html'}catch(_){status.textContent='पोस्टर नहीं भेजा जा सका। चित्र छोटा करें और फिर कोशिश करें।';target.disabled=false}
    }
    if(target.dataset.hub==='poster'||target.dataset.hub==='product'){
      const tab=[...document.querySelectorAll('button')].find(el=>el.textContent.trim()===(target.dataset.hub==='product'?'Product':'Templates'));
      close();tab?.click();document.querySelector('#stageWrap')?.scrollIntoView({block:'nearest',behavior:'smooth'});
    }
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!overlay.hidden)close()});
})();
