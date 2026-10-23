(()=>{'use strict';
if(document.querySelector('.apanam-history-nav'))return;
const box=document.createElement('nav');
box.className='apanam-history-nav';
box.setAttribute('aria-label','Page navigation');
box.innerHTML='<button type="button" data-history-back aria-label="पिछले पेज पर जाएँ">←</button><button type="button" data-history-forward aria-label="अगले पेज पर जाएँ">→</button>';
box.querySelector('[data-history-back]').onclick=()=>history.back();
box.querySelector('[data-history-forward]').onclick=()=>history.forward();
const sync=()=>{
 const mobile=matchMedia('(max-width:900px)').matches;
 const editor=document.body.classList.contains('studio-home-dismissed');
 const row=document.getElementById('studioMobilePrimaryActions');
 if(mobile&&editor&&row){
  if(box.parentElement!==row)row.append(box);
  box.style.setProperty('display','contents','important');
 }else{
  if(!box.isConnected)document.body.append(box);
  box.style.setProperty('display','none','important');
 }
};
sync();
new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
addEventListener('resize',sync);
})();