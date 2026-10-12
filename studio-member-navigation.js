(()=>{'use strict';if(!document.body.classList.contains('membership-page'))return;const root=document.querySelector('.admin-main');if(!root)return;
const nav=document.createElement('nav');nav.id='studioMemberNavigation';nav.setAttribute('aria-label','Membership navigation');root.prepend(nav);
const items=[['studioMemberAccount','Account'],['studioPayments','₹10 / ₹100 भुगतान'],['studioBusinessMember','मेरी अवधि'],['studioSupport','सहायता']];
for(const [id,label] of items){const a=document.createElement('a');a.href='#'+id;a.textContent=label;nav.append(a)}
const advanced=document.createElement('details');advanced.className='member-advanced';advanced.id='memberMore';const summary=document.createElement('summary');summary.textContent='और विकल्प · पुराने भुगतान, योजनाएँ और account';advanced.append(summary);root.append(advanced);
const ids=['studioOwnPayments','studioMemberPlans','studioAiBalance','studioAutoPay','accountDeletion'];function arrange(){for(const id of ids){const el=document.getElementById(id);if(el&&el.parentNode!==advanced)advanced.append(el)}}arrange();new MutationObserver(arrange).observe(root,{childList:true,subtree:true});
nav.addEventListener('click',e=>{const link=e.target.closest('a');if(!link)return;const target=document.querySelector(link.getAttribute('href'));if(target?.closest('#memberMore'))advanced.open=true});
})();