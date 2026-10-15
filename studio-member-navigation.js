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
 ['studioBusinessMember','Memberships','सदस्यता और expiry नियंत्रण'],
 ['studioPayments','Payments','Live payment operations'],
 ['studioOwnPayments','Payment History','भुगतान और receipts'],
 ['studioMemberPlans','Plans','₹10 / ₹100 plan जानकारी'],
 ['studioAiBalance','AI Cost','AI balance, usage और लागत'],
 ['studioAutoPay','Legacy AutoPay','पुराने mandate की स्थिति'],
 ['studioSupport','Support Requests','User tickets, reply और resolve']
];
let groups=userGroups;
const icons={studioAdminOverview:'▦',studioMemberAccount:'●',studioAdminUsers:'♙',studioAdminMemberships:'◆',studioAdminPayments:'₹',studioAdminPaymentHistory:'▤',studioAdminPlans:'≡',studioAdminAiCost:'✦',studioAdminAutoPay:'↻',studioAdminSupport:'?',studioAdminSettings:'⚙',studioAdminActivity:'✓',studioPayments:'₹',studioBusinessMember:'▦',studioOwnPayments:'▤',studioMemberPlans:'≡',studioAiBalance:'✦',studioAutoPay:'↻',accountDeletion:'⚙',studioSupport:'?'};
const menu=document.createElement('details');menu.id='memberVerticalMenu';menu.className='member-vertical-menu';
const summary=document.createElement('summary');summary.textContent='विकल्प चुनें';
const nav=document.createElement('nav');nav.id='studioMemberNavigation';nav.setAttribute('aria-label','Membership विकल्प');
menu.append(summary,nav);root.prepend(menu);
const notice=root.querySelector('.admin-notice');
let adminMode=false;
let current='',registered=false,manualMenu=false;
function available(id){const section=document.getElementById(id);return !!section&&section.parentElement===root;}
function choose(id,{focus=false}={}){
 if(!available(id))id='studioMemberAccount';
 current=id;
 for(const [key] of groups){const section=document.getElementById(key);if(section&&section.parentElement===root)section.hidden=key!==id;}
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
 render();
 if(adminMode&&(current==='accountDeletion'||current==='studioMemberAccount'))choose('studioAdminOverview');
}
render();Promise.resolve(window.APANAM_CLOUD?.authReady).then(detectRole);if(hasOrder&&available('studioPayments'))choose('studioPayments');
const desktop=window.matchMedia('(min-width:900px)');
menu.open=desktop.matches;
desktop.addEventListener('change',e=>{if(!manualMenu)menu.open=e.matches;});
})();