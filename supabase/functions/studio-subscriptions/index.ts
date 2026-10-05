// Cashfree credentials belong only in Edge Function Secrets.
const origin='https://apanambusiness-ship-it.github.io';
function keyFromMap(name:string){try{return JSON.parse(Deno.env.get(name)||'{}').default;}catch{return undefined;}}
const base=Deno.env.get('SUPABASE_URL')!,service=keyFromMap('SUPABASE_SECRET_KEYS')||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,anon=keyFromMap('SUPABASE_PUBLISHABLE_KEYS')||Deno.env.get('SUPABASE_ANON_KEY')!;
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
function config(){const mode=Deno.env.get('STUDIO_PAYMENT_MODE')||'sandbox';if(!['sandbox','production'].includes(mode))throw Error('Payment environment invalid');const prefix=mode==='production'?'CASHFREE_LIVE_':'CASHFREE_TEST_';return {mode,id:Deno.env.get(prefix+'APP_ID'),secret:Deno.env.get(prefix+'SECRET_KEY'),enabled:Deno.env.get('STUDIO_SUBSCRIPTIONS_ENABLED')==='true',url:mode==='production'?'https://api.cashfree.com/pg':'https://sandbox.cashfree.com/pg'};}
async function cloud(path:string,options:RequestInit={},token=service){const r=await fetch(base+path,{...options,headers:{apikey:token===service?service:anon,...(token!==service||service.split('.').length===3?{Authorization:'Bearer '+token}:{}),...options.headers},signal:AbortSignal.timeout(15000)});const data=await r.json().catch(()=>null);if(!r.ok)throw Error(data?.message||'Payment record unavailable');return data;}
const rpc=(name:string,args:Record<string,unknown>)=>cloud('/rest/v1/rpc/'+name,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args)});
async function bounded(req:Request){let length=0;const chunks:Uint8Array[]=[];const reader=req.body?.getReader();if(!reader)return '';while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>32768){await reader.cancel();throw Error('Request too large');}chunks.push(value);}const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
async function cashfree(c:ReturnType<typeof config>,path:string,options:RequestInit={}){const r=await fetch(c.url+path,{...options,headers:{'x-client-id':c.id!,'x-client-secret':c.secret!,'x-api-version':'2025-01-01','Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(20000)});const body=await r.json().catch(()=>null);if(!r.ok)throw Error('Cashfree request failed ('+r.status+'). Retry the same checkout or check status.');return body;}
async function verifySignature(raw:string,timestamp:string,signature:string,secret:string){if(!/^\d{13}$/.test(timestamp)||!signature)return false;let bytes:Uint8Array;try{bytes=Uint8Array.from(atob(signature),ch=>ch.charCodeAt(0));}catch{return false;}const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);return crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(timestamp+raw));}

function localId(value:unknown){const s=String(value||'');if(!/^aps_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s))throw Error('Invalid subscription');return s.slice(4);}
function checkProvider(row:any,p:any){const d=p.plan_details,a=p.authorisation_details;if(p.subscription_id!=='aps_'+row.id||!p.cf_subscription_id||p.subscription_tags?.account_id!==row.user_id||d?.plan_type!=='PERIODIC'||d.plan_currency!=='INR'||Number(d.plan_recurring_amount??d.plan_amount)!==100||Number(d.plan_max_amount)!==100||d.plan_interval_type!=='DAY'||Number(d.plan_intervals)!==30||Math.abs(Date.parse(p.subscription_first_charge_time)-Date.parse(row.first_charge_at))>1000||Number(a?.authorization_amount)!==1||a.authorization_amount_refund!==true)throw Error('Provider mandate mismatch');if(row.provider_id&&String(p.cf_subscription_id)!==row.provider_id)throw Error('Provider ID mismatch');}
async function sync(c:ReturnType<typeof config>,row:any,p:any,cancel=false){checkProvider(row,p);return rpc('studio_subscription_sync',{subscription_uuid:row.id,provider_reference:String(p.cf_subscription_id),provider_status:p.subscription_status,session_value:p.subscription_session_id||null,cancel_requested:cancel});}
async function reconcile(c:ReturnType<typeof config>,row:any,paymentId?:string){const id='aps_'+row.id,p=await cashfree(c,'/subscriptions/'+id);await sync(c,row,p);const list=paymentId?[await cashfree(c,'/subscriptions/'+id+'/payments/'+encodeURIComponent(paymentId))]:await cashfree(c,'/subscriptions/'+id+'/payments');if(!Array.isArray(list))throw Error('Invalid payments response');const credits=[];for(const v of list){if(v.payment_type!=='CHARGE'||v.payment_status!=='SUCCESS')continue;if(v.subscription_id!==id||String(v.cf_subscription_id)!==String(p.cf_subscription_id)||!v.cf_payment_id||Number(v.payment_amount)!==100)throw Error('Provider payment mismatch');credits.push(await rpc('studio_subscription_fulfill',{subscription_uuid:row.id,env:c.mode,provider_payment_id:String(v.cf_payment_id),provider_reference:String(p.cf_subscription_id),amount:10000,currency:p.plan_details.plan_currency,payment_type:v.payment_type,payment_status:v.payment_status,scheduled_at:v.payment_schedule_date}));}return {status:p.subscription_status,environment:c.mode,subscription_id:id,first_charge_at:row.first_charge_at,credits};}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});if(req.method!=='POST')return json({error:'POST required'},405);
 const action=new URL(req.url).searchParams.get('action')||'status';
 try{
  const c=config();
  if(action==='webhook'){
   if(!c.id||!c.secret)return json({error:'Provider not configured'},503);
   const raw=await bounded(req),ts=req.headers.get('x-webhook-timestamp')||'';if(Math.abs(Date.now()-Number(ts))>300000||!await verifySignature(raw,ts,req.headers.get('x-webhook-signature')||'',Deno.env.get(c.mode==='production'?'CASHFREE_LIVE_SUBS_WEBHOOK_SECRET':'CASHFREE_TEST_SUBS_WEBHOOK_SECRET')||c.secret))return json({error:'Invalid webhook signature'},401);
   const event=JSON.parse(raw);if(!String(event.type).startsWith('SUBSCRIPTION_'))return json({received:true});
   const data=event.data||{},subscriptionId=data.subscription_id||data.subscription_details?.subscription_id;if(!subscriptionId)return json({error:'Missing subscription'},400);
   const row=await rpc('studio_subscription_record',{subscription_uuid:localId(subscriptionId)});if(!row||row.environment!==c.mode)return json({received:true,ignored:true});
   return json(await reconcile(c,row,data.payment_id?String(data.payment_id):undefined));
  }
  if(req.headers.get('origin')&&req.headers.get('origin')!==origin)return json({error:'Origin denied'},403);
  const token=(req.headers.get('authorization')||'').replace(/^Bearer /i,'');if(!token)return json({error:'Login required'},401);
  let user:any;try{user=await cloud('/auth/v1/user',{},token);}catch{return json({error:'Login again'},401);}
  if(!user?.id||user.is_anonymous||!user.email_confirmed_at)return json({error:'Verified account required'},403);
  const liveReady=c.mode==='sandbox'||(await cloud('/rest/v1/studio_business_settings?select=payments_enabled&id=eq.true'))[0]?.payments_enabled===true;
  if(action==='status')return json({enabled:c.enabled&&liveReady&&!!c.id&&!!c.secret,configured:!!c.id&&!!c.secret,environment:c.mode,amount_paise:10000,interval_days:30,consent_version:'100-per-30-days-v1',subscriptions:await rpc('studio_subscription_list',{owner_id:user.id,env:c.mode})});
  if(!c.id||!c.secret)return json({error:'Cashfree server keys जोड़ना बाकी है।'},503);
  const body=JSON.parse(await bounded(req)||'{}');
  if(action==='create'){
   if(!c.enabled||!liveReady)return json({error:'AutoPay activation बाकी है।'},403);
   if(body.consent_version!=='100-per-30-days-v1'||body.consent!==true)return json({error:'₹100 हर 30 दिन की स्पष्ट सहमति चाहिए।'},400);
   const phone=String(body.phone||'').replace(/[\s+()-]/g,'').replace(/^91(?=\d{10}$)/,''),name=String(body.name||'').trim();if(!/^[6-9]\d{9}$/.test(phone)||name.length<2||name.length>80)return json({error:'नाम और सही मोबाइल नंबर भरें।'},400);
   const row=await rpc('studio_subscription_reserve',{owner_id:user.id,env:c.mode,consent:body.consent_version});
   if(row.provider_id){const p=await cashfree(c,'/subscriptions/aps_'+row.id);await sync(c,row,p);if(p.subscription_status!=='INITIALIZED')return json({subscription_id:'aps_'+row.id,status:p.subscription_status,environment:c.mode,first_charge_at:row.first_charge_at});return json({subscription_id:'aps_'+row.id,subscription_session_id:p.subscription_session_id,environment:c.mode,first_charge_at:row.first_charge_at});}
   const p=await cashfree(c,'/subscriptions',{method:'POST',headers:{'x-idempotency-key':row.id},body:JSON.stringify({subscription_id:'aps_'+row.id,customer_details:{customer_name:name,customer_email:user.email,customer_phone:phone},plan_details:{plan_name:'APANAMai INR100 30days',plan_type:'PERIODIC',plan_amount:100,plan_max_amount:100,plan_max_cycles:120,plan_intervals:30,plan_interval_type:'DAY',plan_currency:'INR'},authorization_details:{authorization_amount:1,authorization_amount_refund:true,payment_methods:['upi','card']},subscription_meta:{return_url:origin+'/cartoon-video-creation/membership.html?subscription_id=aps_'+row.id,notification_channel:['EMAIL','SMS']},subscription_first_charge_time:row.first_charge_at,subscription_expiry_time:new Date(Date.parse(row.created_at)+3650*86400000).toISOString(),subscription_tags:{account_id:user.id,consent_version:row.consent_version}})});
   await sync(c,row,p);if(!p.subscription_session_id)throw Error('Missing mandate session');return json({subscription_id:p.subscription_id,subscription_session_id:p.subscription_session_id,environment:c.mode,first_charge_at:row.first_charge_at});
  }
  const id=localId(body.subscription_id),row=await rpc('studio_subscription_record',{subscription_uuid:id});if(!row||row.user_id!==user.id||row.environment!==c.mode)return json({error:'Mandate unavailable for this account'},404);
  if(action==='confirm')return json(await reconcile(c,row));
  if(action==='cancel'){
   // Cancellation and reconciliation remain available when new mandates are disabled.
   const p=await cashfree(c,'/subscriptions/aps_'+row.id);checkProvider(row,p);
   if(!['CANCELLED','CUSTOMER_CANCELLED','COMPLETED','EXPIRED','LINK_EXPIRED','CARD_EXPIRED'].includes(p.subscription_status))await cashfree(c,'/subscriptions/aps_'+row.id+'/manage',{method:'POST',headers:{'x-idempotency-key':row.cancel_key},body:JSON.stringify({subscription_id:'aps_'+row.id,action:'CANCEL'})});
   const result=await cashfree(c,'/subscriptions/aps_'+row.id);await sync(c,row,result,true);
   return json({status:result.subscription_status,cancelled:['CANCELLED','CUSTOMER_CANCELLED'].includes(result.subscription_status),message:'मौजूदा सफल भुगतान की अवधि सुरक्षित है। Pending debit हो तो Cashfree स्थिति देखें।'});
  }
  return json({error:'Unknown action'},400);
 }catch(e){return json({error:e instanceof Error?e.message:'Subscription unavailable'},action==='webhook'?503:400);}
});
