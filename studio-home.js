/* Explicit Home routes. Opening a tool must never select a poster. */
(()=>{'use strict';
function init(){
 const home=document.getElementById('studioMobileHome');if(!home)return;
 const byId=id=>document.getElementById(id);
 const media=matchMedia('(max-width:900px)');
 const status=document.createElement('p');status.id='studioHomeStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');home.querySelector('.studio-home-search').after(status);
 const back=document.createElement('button');back.type='button';back.id='studioHomeReturn';back.textContent='⌂ Home';back.setAttribute('aria-label','Home पर वापस जाएँ');document.body.append(back);
 let pending=0,fromHome=false;
 function closePanels(){
  document.querySelectorAll('dialog[open]').forEach(d=>d.close());
  document.querySelectorAll('.studio-library-overlay,.apanam-hub-overlay').forEach(e=>e.hidden=true);
  document.querySelectorAll('.apanam-gallery-backdrop').forEach(e=>e.style.display='none');
  document.body.classList.remove('studio-mobile-tools-open');
  const typing=byId('studioMobileTypingPanel');if(typing){typing.hidden=true;typing.style.display='none';}
 }
 function showHome(){pending++;closePanels();document.body.classList.remove('studio-home-dismissed');fromHome=false;status.textContent='';home.querySelector('[data-home-nav="home"]')?.focus();}
 function enter(){closePanels();if(media.matches&&!document.body.classList.contains('studio-home-dismissed')){window.history.pushState({studioHomeTool:true},'');fromHome=true;}document.body.classList.add('studio-home-dismissed');status.textContent='';}
 function returnHome(){if(fromHome&&window.history.state?.studioHomeTool){window.history.back();}else showHome();}
 back.onclick=returnHome;
 window.addEventListener('popstate',()=>{if(media.matches)showHome();});
 document.addEventListener('click',e=>{if(!media.matches||!fromHome)return;if(e.target.closest('[data-history-back],#studioHeaderPrev')){e.preventDefault();e.stopImmediatePropagation();returnHome();}},true);
 // Wait for the asynchronously loaded catalog instead of racing an 80ms timer.
 async function ready(id){const token=++pending;let button;for(let n=0;n<100;n++){button=byId(id);if(button&&!button.disabled&&(id!=='studioTemplateLibrary'||typeof button.onclick==='function'))return token===pending?button:null;await new Promise(r=>setTimeout(r,50));if(token!==pending)return null;}status.textContent='यह विकल्प अभी लोड नहीं हुआ। कृपया दोबारा दबाएँ।';return null;}
 async function openTool(id){const button=await ready(id);if(!button)return;enter();button.click();}
 const aliases={Festival:'त्योहार · वर्षभर',Invitation:'संस्था',Food:'Restaurant',Political:'राजनीतिक'};
 async function templates({category='',query='',filter=false}={}){
  const button=await ready('studioTemplateLibrary');if(!button)return;
  enter();button.click();
  const search=byId('studioTemplateSearch'),select=byId('studioTemplateCategory'),date=byId('studioDateMode');
  if(!search||!select)return;
  const wanted=aliases[category]||category;
  select.value=[...select.options].some(o=>o.value===wanted)?wanted:'';
  search.value=query; if(date){date.value='all';date.dispatchEvent(new Event('change',{bubbles:true}));}
  select.dispatchEvent(new Event('change',{bubbles:true}));search.dispatchEvent(new Event('input',{bubbles:true}));
  (filter?select:search).focus();
 }
 home.querySelector('#studioHomeMenu').onclick=()=>openTool('studioMobileAllActions');
 home.querySelector('#studioHomeCreate').onclick=()=>openTool('apanamCreatorHubButton');
 home.querySelectorAll('[data-home-category]').forEach(b=>b.onclick=()=>templates({category:b.dataset.homeCategory}));
 // Featured cards lead to matching designs, not an unrelated existing canvas.
 const featured=['दीपावली','','','','','','',''];
 home.querySelectorAll('#studioHomeFeatured button').forEach((b,i)=>b.onclick=()=>templates({category:i===0?'':b.dataset.homeCategory,query:featured[i]||''}));
 home.querySelector('#studioHomeAllCategories').onclick=()=>templates({filter:true});
 home.querySelector('#studioHomeTemplates').onclick=()=>templates();
 home.querySelector('#studioHomeTemplateFilter').onclick=()=>templates({query:byId('studioHomeTemplateSearch').value.trim(),filter:true});
 const search=byId('studioHomeTemplateSearch');search.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();templates({query:search.value.trim()});}});
 search.addEventListener('search',()=>templates({query:search.value.trim()}));
 home.querySelectorAll('[data-home-nav]').forEach(b=>b.onclick=()=>{switch(b.dataset.homeNav){case 'home':showHome();break;case 'templates':templates();break;case 'designs':openTool('loadProject');break;case 'chat':openTool('studioSupportOpen');break;}});
 home.querySelector('[data-home-tool="size"]').onclick=()=>openTool('studioPosterSize');
 home.querySelector('[data-home-tool="text-image"]').onclick=()=>openTool('apanamCreatorHubButton');
 // Preserve the user's activation: file pickers must open in the click itself.
 home.querySelector('[data-home-tool="upload"]').onclick=()=>{const input=byId('imageUpload');if(!input){status.textContent='Upload अभी तैयार नहीं है।';return;}input.click();};
 byId('imageUpload')?.addEventListener('change',e=>{if(e.target.files?.length)enter();});
 showHome();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
