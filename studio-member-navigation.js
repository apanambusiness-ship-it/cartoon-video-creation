(()=>{'use strict';
if(!document.body.classList.contains('membership-page'))return;
const root=document.querySelector('.admin-main');
if(!root)return;
const chatButton=document.getElementById('studioSupportOpen');
if(chatButton){
 chatButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v9a2.5 2.5 0 0 1-2.5 2.5H10l-5 4v-4.6A2.5 2.5 0 0 1 4 14.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 8h8M8 12h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>AI Chat</span>';
 chatButton.setAttribute('aria-label','AI Chat');
}
const userGroups=[
 ['studioMemberAccount','Account','Login और profile'],
 ['studioPayments','भुगतान','₹10 registration या ₹100 renewal'],
 ['studioBusinessMember','मेरी अवधि','सदस्यता और reminder'],
 ['studioOwnPayments','पुराने भुगतान','रसीद और history'],
 ['studioMemberPlans','योजनाएँ','शुल्क और सुविधाएँ'],
 ['studioAiBalance','AI लागत','AI balance और उपयोग'],
 ['studioAutoPay','पुराने AutoPay','पुराने mandate की स्थिति'],
 ['accountDeletion','Account settings','Account और data प्रबंधन'],
 ['studioSupport','सहायता','Payment या refund समस्या']
];
const adminGroups=[
 ['studioAdminOverview','Dashboard','Business overview और जरूरी actions'],
 ['studioMemberAccount','Admin Account','Admin login और profile'],
 ['studioAdminUsers','Users','सभी users और profiles'],
 ['studioBusinessMember','Memberships','सदस्यता और expiry नियंत्रण'],
 ['studioPayments','Payments','Live payment operations'],
 ['studioOwnPayments','Payment History','भुगतान और receipts'],
 ['studioMemberPlans','Plans','₹10 / ₹100 plan जानकारी'],
 ['studioAiBalance','AI Cost','AI balance, usage और लागत'],
 ['studioAutoPay','Legacy AutoPay','पुराने mandate की स्थिति'],
 ['studioSupport','Support Requests','User tickets, reply और resolve'],
 ['studioAdminSettings','Settings','Business और system settings'],
 ['studioAdminTemplates','Posters / Templates','Catalog visibility और advanced editor'],
 ['studioAdminActivity','Activity & Security','Admin security और operations']
];
let groups=userGroups;
const icons={studioAdminOverview:'▦',studioMemberAccount:'●',studioAdminUsers:'♙',studioAdminMemberships:'◆',studioAdminPayments:'₹',studioAdminPaymentHistory:'▤',studioAdminPlans:'≡',studioAdminAiCost:'✦',studioAdminAutoPay:'↻',studioAdminSupport:'?',studioAdminSettings:'⚙',studioAdminActivity:'✓',studioPayments:'₹',studioBusinessMember:'▦',studioOwnPayments:'▤',studioMemberPlans:'≡',studioAiBalance:'✦',studioAutoPay:'↻',accountDeletion:'⚙',studioSupport:'?'};
const menu=document.createElement('details');menu.id='memberVerticalMenu';menu.className='member-vertical-menu';
const summary=document.createElement('summary');summary.textContent='विकल्प चुनें';
const nav=document.createElement('nav');nav.id='studioMemberNavigation';nav.setAttribute('aria-label','Membership विकल्प');
menu.append(summary,nav);root.prepend(menu);
const notice=root.querySelector('.admin-notice');
let adminMode=false;
function adminize(){
 if(!adminMode)return;
 const copy={studioMemberAccount:['Admin Account','Admin login, profile और security'],studioBusinessMember:['Memberships','सदस्यता और expiry control'],studioPayments:['Payments','Live payment operations'],studioOwnPayments:['Payment History','Transaction records और receipts'],studioMemberPlans:['Plans','Registration और membership plans'],studioAiBalance:['AI Cost','AI usage, balance और लागत'],studioAutoPay:['Legacy AutoPay','पुराने mandates'],studioSupport:['Support Requests','Tickets, reply और resolve']};
 for(const [id,[title]] of Object.entries(copy)){const s=document.getElementById(id);if(!s)continue;const h=s.querySelector(':scope>h2');if(h)h.textContent=title;}
 const support=document.getElementById('studioSupport');if(support){const p=support.querySelector(':scope>p');if(p)p.textContent='Users के Support Requests देखें, जवाब Save करें और ticket को Resolved या Open करें।';}
 const plans=document.getElementById('studioMemberPlans');if(plans){const h=plans.querySelector(':scope>h2');if(h)h.textContent='Plans';}
}
let current='',registered=false,manualMenu=false;
function available(id){const section=document.getElementById(id);return !!section&&section.parentElement===root;}
function choose(id,{focus=false}={}){
 if(!available(id))id='studioMemberAccount';
 current=id;
 const allIds=[...new Set([...userGroups,...adminGroups].map(row=>row[0]))];for(const key of allIds){const section=document.getElementById(key);if(section&&section.parentElement===root)section.hidden=key!==id;}
 for(const button of nav.querySelectorAll('button[data-target]')){const active=button.dataset.target===id;button.setAttribute('aria-current',active?'page':'false');button.setAttribute('aria-pressed',String(active));button.style.setProperty('background-color',active?'#552496':'','important');button.style.setProperty('color',active?'#ffffff':'','important');for(const el of button.querySelectorAll('strong,strong span'))el.style.setProperty('color',active?'#ffffff':'','important');}
 summary.textContent='विकल्प: '+(groups.find(row=>row[0]===id)?.[1]||'Account');
 if(notice)notice.hidden=id!=='studioPayments';
 document.body.dataset.memberSection=id;
 if(window.matchMedia('(max-width:899px)').matches)menu.open=false;
 if(focus){const section=document.getElementById(id);section?.scrollIntoView({block:'start',behavior:'smooth'});section?.querySelector('h2')?.setAttribute('tabindex','-1');section?.querySelector('h2')?.focus({preventScroll:true});}
}
function render(){
 const existing=new Map([...nav.querySelectorAll('button[data-target]')].map(b=>[b.dataset.target,b]));
 for(const [id,label,description] of groups){
  let b=existing.get(id);
  if(!b){b=document.createElement('button');b.type='button';b.dataset.target=id;b.setAttribute('aria-controls',id);b.innerHTML='<strong></strong><small></small>';nav.append(b);}
  const strong=b.querySelector('strong');
  let icon=strong.querySelector('.member-nav-icon');
  if(!icon){icon=document.createElement('span');icon.className='member-nav-icon';icon.setAttribute('aria-hidden','true');strong.append(icon,document.createElement('span'));}
  icon.textContent=icons[id]||'•';strong.lastElementChild.textContent=label;
  b.querySelector('small').textContent=description;
  b.hidden=!available(id);
 }
 for(const b of nav.querySelectorAll('button[data-target]'))if(!groups.some(row=>row[0]===b.dataset.target))b.hidden=true;
 if(!available(current))choose('studioMemberAccount');
 else choose(current);
}
nav.addEventListener('click',e=>{const button=e.target.closest('button[data-target]');if(!button||button.hidden)return;e.preventDefault();e.stopPropagation();if(button.dataset.target==='studioSupport'){document.getElementById('studioSupportDialog')?.close();}choose(button.dataset.target,{focus:true});});
menu.addEventListener('toggle',()=>{manualMenu=true;});
document.addEventListener('apanam-registration-status',e=>{registered=!!e.detail?.registered;document.body.classList.toggle('member-registered',registered);render();});
document.addEventListener('apanam-cloud-session',()=>{if(!window.APANAM_CLOUD?.user()){registered=false;adminMode=false;groups=userGroups;document.body.classList.remove('member-registered','member-admin-mode');choose('studioMemberAccount');render();}else detectRole();});
new MutationObserver(()=>render()).observe(root,{childList:true});
const hasOrder=new URLSearchParams(location.search).has('order_id');
async function detectRole(){
 try{adminMode=!!(window.APANAM_CLOUD?.user()&&await window.APANAM_CLOUD.isAdmin());}catch{adminMode=false;}
 groups=adminMode?adminGroups:userGroups;
 document.body.classList.toggle('member-admin-mode',adminMode);
 adminize();render();
 if(adminMode){if(current==='accountDeletion'||current==='studioMemberAccount')choose('studioAdminOverview');await Promise.allSettled([dashboardCounts(),loadAdminUsers(),loadAdminOps(),loadUnifiedSettings(),loadUnifiedTemplates()]);}
}
render();Promise.resolve(window.APANAM_CLOUD?.authReady).then(detectRole);if(hasOrder&&available('studioPayments'))choose('studioPayments');
let adminUserOffset=0;const adminUserPageSize=50;async function loadAdminUsers(reset=false){if(!adminMode)return;const out=document.getElementById('studioAdminUserList'),form=document.getElementById('studioAdminUserSearch'),status=document.getElementById('studioAdminUserStatus');if(!out)return;if(reset)adminUserOffset=0;const search=(form?.elements.search?.value||'').trim(),filter=form?.elements.validity?.value||'all';if(status)status.textContent='Users load हो रहे हैं…';try{const rows=await window.APANAM_CLOUD.adminUsers(search,adminUserOffset,filter),countData=await window.APANAM_CLOUD.adminUserCount(search,filter),total=Number(countData?.count??countData?.total??countData)||0;out.replaceChildren();for(const u of rows||[]){const p=document.createElement('p');const expiry=u.effective_expires_at||u.expires_at;const parts=[u.full_name||u.email||'User',u.email||'',u.source||u.plan||''];if(expiry)parts.push('Expiry '+new Date(expiry).toLocaleDateString('hi-IN'));p.textContent=parts.filter(Boolean).join(' · ');out.append(p);}if(!rows?.length)out.textContent='कोई user record नहीं मिला।';const page=Math.floor(adminUserOffset/adminUserPageSize)+1,pages=Math.max(1,Math.ceil(total/adminUserPageSize));const pageEl=document.getElementById('studioAdminUserPage'),prev=document.getElementById('studioAdminUserPrev'),next=document.getElementById('studioAdminUserNext');if(pageEl)pageEl.textContent='पेज '+page+' / '+pages+' · कुल '+total;if(prev)prev.disabled=adminUserOffset<=0;if(next)next.disabled=adminUserOffset+adminUserPageSize>=total;if(status)status.textContent=total+' user मिले।';}catch(e){out.replaceChildren();if(status)status.textContent='Users load नहीं हुए: '+e.message;}}const adminUserForm=document.getElementById('studioAdminUserSearch');adminUserForm?.addEventListener('submit',e=>{e.preventDefault();loadAdminUsers(true);});document.getElementById('studioAdminUserRefresh')?.addEventListener('click',()=>loadAdminUsers(false));document.getElementById('studioAdminUserPrev')?.addEventListener('click',()=>{adminUserOffset=Math.max(0,adminUserOffset-adminUserPageSize);loadAdminUsers();});document.getElementById('studioAdminUserNext')?.addEventListener('click',()=>{adminUserOffset+=adminUserPageSize;loadAdminUsers();});
let unifiedSettingsData=null;async function loadUnifiedSettings(){if(!adminMode)return;const form=document.getElementById('studioUnifiedSettings'),status=document.getElementById('studioUnifiedSettingsStatus');if(!form||!window.APANAM_CLOUD?.load)return;try{status.textContent='Settings load हो रही हैं…';unifiedSettingsData=await window.APANAM_CLOUD.load('draft');const s=unifiedSettingsData?.settings||{};for(const e of form.elements){if(!e.name)continue;if(e.type==='checkbox')e.checked=!!s[e.name];else e.value=s[e.name]??(e.type==='color'?'#552496':'');}status.textContent='Cloud draft settings तैयार हैं।';}catch(e){status.textContent='Settings load नहीं हुई: '+e.message;}}
const unifiedSettingsForm=document.getElementById('studioUnifiedSettings');unifiedSettingsForm?.addEventListener('submit',async e=>{e.preventDefault();const status=document.getElementById('studioUnifiedSettingsStatus');try{if(!adminMode)throw Error('Admin access required');const fresh=await window.APANAM_CLOUD.load('draft');const next=structuredClone(fresh),s=next.settings||(next.settings={});for(const x of unifiedSettingsForm.elements){if(!x.name)continue;s[x.name]=x.type==='checkbox'?x.checked:x.value;}await window.APANAM_CLOUD.save('draft',next);unifiedSettingsData=next;status.textContent='Settings Cloud draft में Save हुई। Live app के लिए Publish / Backup खोलें।';}catch(x){status.textContent='Settings Save नहीं हुई: '+x.message;}});document.getElementById('studioUnifiedSettingsRefresh')?.addEventListener('click',loadUnifiedSettings);document.getElementById('studioUnifiedPublish')?.addEventListener('click',async()=>{const status=document.getElementById('studioUnifiedPublishStatus'),b=document.getElementById('studioUnifiedPublish');if(!adminMode)return;if(!confirm('Cloud draft की visible settings/templates सभी users के लिए Publish करें?'))return;b.disabled=true;try{status.textContent='Publish हो रहा है…';const draft=await window.APANAM_CLOUD.load('draft');const ready=await window.APANAM_CLOUD.prepareAssets(draft);await window.APANAM_CLOUD.save('draft',ready);await window.APANAM_CLOUD.save('published',ready);status.textContent='Publish सफल। Users refresh करके नया version देख सकते हैं।';}catch(e){status.textContent='Publish पूरा नहीं हुआ: '+e.message;}finally{b.disabled=false;}});
let unifiedTemplateCatalog=null;async function loadUnifiedTemplates(){if(!adminMode)return;const out=document.getElementById('studioUnifiedTemplatesList'),status=document.getElementById('studioUnifiedTemplatesStatus');if(!out||!status)return;try{status.textContent='Templates load हो रहे हैं…';unifiedTemplateCatalog=await window.APANAM_CLOUD.load('draft');const rows=unifiedTemplateCatalog?.templates||[];out.replaceChildren();for(const t of rows){const card=document.createElement('article');card.className='plan';const h=document.createElement('h3');h.textContent=t.name||'Template';const p=document.createElement('p');p.textContent=(t.category||'General')+(t.occasion?' · '+t.occasion:'');const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=!!t.published;label.append(check,document.createTextNode(' User Library में दिखाएँ'));check.onchange=async()=>{check.disabled=true;const wanted=check.checked;try{const fresh=await window.APANAM_CLOUD.load('draft'),rows=fresh?.templates||[],target=rows.find(x=>x.id===t.id);if(!target)throw Error('Template का नया record नहीं मिला; Refresh करें।');target.published=wanted;target.updatedAt=new Date().toISOString();await window.APANAM_CLOUD.save('draft',fresh);unifiedTemplateCatalog=fresh;status.textContent='Template visibility latest Cloud draft में Save हुई। Live users के लिए Publish करें।';}catch(e){check.checked=!wanted;status.textContent='Save नहीं हुआ: '+e.message;}finally{check.disabled=false;}};card.append(h,p,label);out.append(card);}status.textContent='कुल '+rows.length+' templates · '+rows.filter(x=>x.published).length+' visible';}catch(e){status.textContent='Templates load नहीं हुए: '+e.message;}}
document.getElementById('studioUnifiedTemplatesRefresh')?.addEventListener('click',loadUnifiedTemplates);
function downloadCatalogBackup(){const status=document.getElementById('studioCatalogBackupStatus');try{if(!adminMode)throw Error('Admin access required');window.APANAM_CLOUD.load('draft').then(data=>{const blob=new Blob([JSON.stringify({format:'APANAMAI-CATALOG-BACKUP',version:1,created_at:new Date().toISOString(),data},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='APANAMai-catalog-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);if(status)status.textContent='Catalog backup तैयार और डाउनलोड हुआ।';}).catch(e=>{if(status)status.textContent='Backup नहीं बना: '+e.message;});}catch(e){if(status)status.textContent=e.message;}}
document.getElementById('studioCatalogBackup')?.addEventListener('click',downloadCatalogBackup);document.getElementById('studioCatalogBackupRestore')?.addEventListener('change',async e=>{const status=document.getElementById('studioCatalogBackupStatus'),file=e.target.files?.[0];if(!file)return;try{if(!adminMode)throw Error('Admin access required');if(file.size>25*1024*1024)throw Error('Backup 25 MB तक रखें।');const j=JSON.parse(await file.text());if(j?.format!=='APANAMAI-CATALOG-BACKUP'||j?.version!==1||!j?.data)throw Error('यह APANAMai catalog backup नहीं है');if(!confirm('इस backup से Cloud draft बदलें? Live catalog अभी नहीं बदलेगा।'))return;const clean=window.APANAM_CATALOG.catalog(j.data),ready=await window.APANAM_CLOUD.prepareAssets(clean);await window.APANAM_CLOUD.save('draft',ready);unifiedTemplateCatalog=ready;status.textContent='Backup Cloud draft में Restore हुआ। Templates जाँचें, फिर Publish करें।';await loadUnifiedTemplates();}catch(x){status.textContent='Restore असफल: '+x.message;}finally{e.target.value='';}});
async function loadUnifiedRecovery(){if(!adminMode)return;const out=document.getElementById('studioUnifiedRecoveryList'),activity=document.getElementById('studioAdminActivityData');if(!out)return;try{const d=await window.APANAM_CLOUD.adminOperations('overview');out.replaceChildren();const rows=d?.recovery||[];for(const row of rows.slice(0,10)){const card=document.createElement('article');card.className='plan';const p=document.createElement('p');p.textContent=(row.catalog_id||'catalog')+' · v'+row.version+' · '+new Date(row.saved_at).toLocaleString('hi-IN');const b=document.createElement('button');b.type='button';b.textContent='इस version को Draft में Restore';b.onclick=async()=>{if(!confirm((row.catalog_id||'catalog')+' v'+row.version+' को Cloud draft में Restore करें? Live users अभी नहीं बदलेंगे।'))return;b.disabled=true;try{const v=await window.APANAM_CLOUD.adminOperations('recovery_get',{catalog_id:row.catalog_id,version:row.version}),clean=window.APANAM_CATALOG.catalog(v.payload),ready=await window.APANAM_CLOUD.prepareAssets(clean);await window.APANAM_CLOUD.save('draft',ready);if(activity)activity.textContent='Recovery v'+row.version+' Cloud draft में Restore हुई। Preview के बाद Publish करें।';await loadUnifiedTemplates();}catch(x){if(activity)activity.textContent='Recovery Restore असफल: '+x.message;}finally{b.disabled=false;}};card.append(p,b);out.append(card);}if(!rows.length)out.textContent='अभी पुरानी recovery version उपलब्ध नहीं है।';if(activity)activity.textContent='Operations: '+(d?.services?.length||0)+' services · '+rows.length+' recovery versions · '+(d?.audit?.length||0)+' recent activity records.';}catch(x){out.textContent='Recovery load नहीं हुई: '+x.message;}}
document.getElementById('studioAdminActivityRefresh')?.addEventListener('click',async()=>{await loadAdminOps();await loadUnifiedRecovery();});
document.getElementById('studioCatalogBackupCheck')?.addEventListener('change',async e=>{const status=document.getElementById('studioCatalogBackupStatus'),file=e.target.files?.[0];if(!file)return;try{const j=JSON.parse(await file.text());if(j?.format!=='APANAMAI-CATALOG-BACKUP'||j?.version!==1||!j?.data)throw Error('यह APANAMai catalog backup नहीं है');status.textContent='Backup सही है · '+new Date(j.created_at).toLocaleString('hi-IN')+' · Restore के लिए Advanced Operations खोलें।';}catch(x){status.textContent='Backup जाँच असफल: '+x.message;}finally{e.target.value='';}});
async function loadAdminOps(){if(!adminMode)return;const s=document.getElementById('studioAdminSettingsData'),a=document.getElementById('studioAdminActivityData');try{const d=await window.APANAM_CLOUD.adminBusiness('overview');if(s)s.textContent=d?.message||'Business settings backend उपलब्ध है।';}catch(e){if(s)s.textContent=e.message;}try{const d=await window.APANAM_CLOUD.adminOperations('status');if(a)a.textContent=d?.message||'Security/operations status backend उपलब्ध है।';}catch(e){if(a)a.textContent=e.message;}}
async function dashboardCounts(){if(!adminMode)return;try{const a=await window.APANAM_CLOUD.adminUserCount('', 'all');const e=document.getElementById('adminDashUsers');if(e)e.textContent='कुल '+(Number(a?.count??a?.total??a)||0);}catch{}try{const a=await window.APANAM_CLOUD.adminUserCount('', 'active');const e=document.getElementById('adminDashMembers');if(e)e.textContent='Active '+(Number(a?.count??a?.total??a)||0);}catch{}try{const a=await window.APANAM_CLOUD.adminSupportTickets();const e=document.getElementById('adminDashSupport');if(e)e.textContent='Open '+(a||[]).filter(x=>x.status==='open').length;}catch{}}
Promise.resolve(window.APANAM_CLOUD?.authReady).then(()=>{setTimeout(dashboardCounts,0);setTimeout(loadAdminUsers,0);setTimeout(loadAdminOps,0);setTimeout(loadUnifiedSettings,0);setTimeout(loadUnifiedTemplates,0);});

window.addEventListener('apanam-admin-payment-summary',e=>{const d=e.detail||{},x=document.getElementById('adminDashPayments');if(x&&d.environment==='production'&&d.state==='all'&&d.offset===0)x.textContent='Paid '+d.paid+' · ₹'+(Number(d.amount||0)/100).toLocaleString('hi-IN');});
const desktop=window.matchMedia('(min-width:900px)');
menu.open=desktop.matches;
desktop.addEventListener('change',e=>{if(!manualMenu)menu.open=e.matches;});
})();