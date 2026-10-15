(()=>{'use strict';
const api=window.APANAM_CLOUD;
function node(tag,text,cls){const x=document.createElement(tag);if(text)x.textContent=text;if(cls)x.className=cls;return x;}
function buildMemberSupport(){
 const support=document.getElementById('studioSupport');if(!support||document.getElementById('memberInlineSupportForm'))return;
 const panel=node('div','', 'support-ticket-box support-ticket-inline');
 panel.innerHTML='<h3>Support Request</h3><form id="memberInlineSupportForm"><label>विषय<input name="subject" maxlength="120" required placeholder="जैसे: Payment या App समस्या"></label><label>समस्या<textarea name="message" maxlength="2000" rows="5" required placeholder="समस्या साफ-साफ लिखें"></textarea></label><button type="submit">Support Request भेजें</button></form><p id="memberInlineSupportStatus" role="status"></p><div id="memberInlineSupportList"></div>';
 support.append(panel);
 const form=panel.querySelector('form'),status=panel.querySelector('[role="status"]'),list=panel.querySelector('#memberInlineSupportList');
 async function load(){if(!api?.user?.()){status.textContent='Support Request भेजने के लिए Login करें।';return;}try{const rows=await api.mySupportTickets();list.replaceChildren();for(const r of rows){const card=node('article','', 'support-ticket-item');card.append(node('strong',(r.status==='open'?'🟠 Open · ':'✅ Resolved · ')+r.subject),node('p',r.message));if(r.admin_reply)card.append(node('p','Admin जवाब: '+r.admin_reply));list.append(card);}}catch(e){status.textContent=e.message;}}
 form.addEventListener('submit',async e=>{e.preventDefault();if(!api?.user?.()){status.textContent='पहले Login करें।';return;}const b=form.querySelector('button');b.disabled=true;try{await api.createSupportTicket(form.elements.subject.value.trim(),form.elements.message.value.trim());form.reset();status.textContent='Support Request भेज दी गई।';await load();}catch(err){status.textContent=err.message;}finally{b.disabled=false;}});
 document.addEventListener('apanam-cloud-session',load);Promise.resolve(api?.authReady).then(load);
}
function buildAdminSupport(){
 const main=document.querySelector('.admin-main');if(!main||!document.getElementById('studioCloudLogin')||document.getElementById('supportTickets'))return;
 const sec=node('section');sec.id='supportTickets';sec.innerHTML='<h2>Support Requests</h2><div class="admin-actions"><button type="button" id="supportTicketRefresh">Refresh</button></div><p id="supportTicketStatus" role="status">Admin login करें।</p><div id="supportTicketList"></div>';main.append(sec);
 const out=sec.querySelector('#supportTicketList'),status=sec.querySelector('#supportTicketStatus');
 async function load(){if(!api?.user?.())return;try{const rows=await api.adminSupportTickets();out.replaceChildren();status.textContent='कुल '+rows.length+' requests';for(const r of rows){const card=node('article','', 'payment-record');card.append(node('h3',(r.status==='open'?'🟠 Open · ':'✅ Resolved · ')+(r.subject||'Support')),node('p',(r.full_name||r.email||r.user_id)+' · '+new Date(r.created_at).toLocaleString('hi-IN')),node('p',r.message));const ta=document.createElement('textarea');ta.rows=3;ta.value=r.admin_reply||'';const actions=node('div','', 'admin-actions'),save=node('button','जवाब Save करें'),toggle=node('button',r.status==='resolved'?'Open करें':'Resolved करें');save.onclick=async()=>{await api.adminUpdateSupportTicket(r.id,r.status,ta.value);status.textContent='जवाब save हो गया।';};toggle.onclick=async()=>{await api.adminUpdateSupportTicket(r.id,r.status==='resolved'?'open':'resolved',ta.value);await load();};actions.append(save,toggle);card.append(ta,actions);out.append(card);}}catch(e){status.textContent=e.message;}}
 sec.querySelector('#supportTicketRefresh').onclick=load;document.addEventListener('apanam-cloud-session',load);Promise.resolve(api?.authReady).then(load);
}
buildMemberSupport();buildAdminSupport();
})();