// Cashfree credentials belong only in Edge Function Secrets.
const origin='https://apanambusiness-ship-it.github.io';
function keyFromMap(name:string){try{return JSON.parse(Deno.env.get(name)||'{}').default;}catch{return undefined;}}
const base=Deno.env.get('SUPABASE_URL')!,service=keyFromMap('SUPABASE_SECRET_KEYS')||Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,anon=keyFromMap('SUPABASE_PUBLISHABLE_KEYS')||Deno.env.get('SUPABASE_ANON_KEY')!;
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
function config(){const mode=Deno.env.get('STUDIO_PAYMENT_MODE')||'sandbox';if(!['sandbox','production'].includes(mode))throw Error('Payment environment invalid');const prefix=mode==='production'?'CASHFREE_LIVE_':'CASHFREE_TEST_';return {mode,id:Deno.env.get(prefix+'APP_ID'),secret:Deno.env.get(prefix+'SECRET_KEY'),enabled:Deno.env.get('STUDIO_PAYMENTS_ENABLED')==='true',url:mode==='production'?'https://api.cashfree.com/pg':'https://sandbox.cashfree.com/pg'};}
async function cloud(path:string,options:RequestInit={},token=service){const r=await fetch(base+path,{...options,headers:{apikey:token===service?service:anon,...(token!==service||service.split('.').length===3?{Authorization:'Bearer '+token}:{}),...options.headers},signal:AbortSignal.timeout(15000)});const data=await r.json().catch(()=>null);if(!r.ok)throw Error(data?.message||'Payment record unavailable');return data;}
const rpc=(name:string,args:Record<string,unknown>)=>cloud('/rest/v1/rpc/'+name,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args)});
async function bounded(req:Request){let length=0;const chunks:Uint8Array[]=[];const reader=req.body?.getReader();if(!reader)return '';while(true){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>32768){await reader.cancel();throw Error('Request too large');}chunks.push(value);}const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
async function cashfree(c:ReturnType<typeof config>,path:string,options:RequestInit={}){const r=await fetch(c.url+path,{...options,headers:{'x-client-id':c.id!,'x-client-secret':c.secret!,'x-api-version':'2025-01-01','Content-Type':'application/json',...options.headers},signal:AbortSignal.timeout(20000)});const body=await r.json().catch(()=>null);if(!r.ok)throw Error('Cashfree request failed ('+r.status+'). Retry the same checkout or check status.');return body;}
function orderUUID(value:unknown){const id=String(value||'');if(!/^apn_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))throw Error('Invalid order');return id.slice(4);}
async function verifySignature(raw:string,timestamp:string,signature:string,secret:string){if(!/^\d{13}$/.test(timestamp)||!signature)return false;let bytes:Uint8Array;try{bytes=Uint8Array.from(atob(signature),ch=>ch.charCodeAt(0));}catch{return false;}const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);return crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(timestamp+raw));}
async function confirm(c:ReturnType<typeof config>,row:any){const orderId='apn_'+row.id,order=await cashfree(c,'/orders/'+orderId);if(order.order_id!==orderId||order.order_currency!=='INR'||Math.round(Number(order.order_amount)*100)!==row.amount_paise||order.customer_details?.customer_id!==row.user_id)throw Error('Provider order mismatch');if(order.order_status!=='PAID')return {paid:false,status:order.order_status,order_id:orderId,environment:c.mode};const payments=await cashfree(c,'/orders/'+orderId+'/payments');if(!Array.isArray(payments))throw Error('Invalid provider response');const payment=payments.find(p=>p.payment_status==='SUCCESS'&&p.payment_currency==='INR'&&Math.round(Number(p.payment_amount)*100)===row.amount_paise&&p.cf_payment_id!=null);if(!payment)throw Error('Successful matching payment unavailable');return {...await rpc('studio_payment_fulfill',{order_uuid:row.id,env:c.mode,amount:row.amount_paise,currency:'INR',provider_payment_id:String(payment.cf_payment_id)}),order_id:orderId};}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});if(req.method!=='POST')return json({error:'POST required'},405);
 const action=new URL(req.url).searchParams.get('action')||'status';
 try{
  const c=config();
  if(action==='webhook'){
   if(!c.id||!c.secret)return json({error:'Provider not configured'},503);
   const raw=await bounded(req);if(!await verifySignature(raw,req.headers.get('x-webhook-timestamp')||'',req.headers.get('x-webhook-signature')||'',c.secret))return json({error:'Invalid webhook signature'},401);
   const event=JSON.parse(raw);if(event.type!=='PAYMENT_SUCCESS_WEBHOOK')return json({received:true});
   const id=orderUUID(event.data?.order?.order_id),row=await rpc('studio_payment_order',{order_uuid:id});if(!row||row.environment!==c.mode)return json({received:true,ignored:true});
   // Even signed events are confirmed with Cashfree APIs; retries are idempotent in SQL.
   return json(await confirm(c,row));
  }
  const token=(req.headers.get('authorization')||'').replace(/^Bearer /i,'');if(!token)return json({error:'Login required'},401);
  let user:any;try{user=await cloud('/auth/v1/user',{},token);}catch{return json({error:'Session invalid. Login again.'},401);}
  if(!user?.id||user.is_anonymous||!user.email_confirmed_at)return json({error:'Verified email account required'},403);
  const liveReady=c.mode==='sandbox'||!!(await cloud('/rest/v1/studio_business_settings?id=eq.true&select=payments_enabled'))?.[0]?.payments_enabled;
  if(action==='status')return json({environment:c.mode,configured:!!c.id&&!!c.secret,enabled:c.enabled&&!!c.id&&!!c.secret&&liveReady,registration_enabled:c.enabled&&!!c.id&&!!c.secret&&liveReady&&Deno.env.get('STUDIO_SUBSCRIPTIONS_ENABLED')==='true',registration:await rpc('studio_registration_status',{owner_id:user.id,env:c.mode}),plans:{registration:1000,manual:10000}});
  if(!c.id||!c.secret)return json({error:'Cashfree server keys जोड़ना बाकी है।'},503);
  const body=JSON.parse(await bounded(req)||'{}');
  if(action==='create'){
   if(!c.enabled||!liveReady)return json({error:'Checkout अभी बंद है।'},403);
   const phone=String(body.phone||'').replace(/[\s+()-]/g,'').replace(/^91(?=\d{10}$)/,'');if(!/^[6-9]\d{9}$/.test(phone))return json({error:'सही 10 अंकों का मोबाइल नंबर भरें।'},400);
   if(body.plan==='registration'&&(Deno.env.get('STUDIO_SUBSCRIPTIONS_ENABLED')!=='true'||body.consent!==true||body.consent_version!=='registration-10-trial15-autopay100-30-v1'))return json({error:'₹10 registration के साथ ₹100 हर 30 दिन AutoPay की स्पष्ट अनुमति और Subscriptions activation जरूरी है।'},400);
   if(body.plan==='registration'){const prior=await rpc('studio_registration_status',{owner_id:user.id,env:c.mode});if(prior?.order_id){const priorRow=await rpc('studio_payment_order',{order_uuid:orderUUID(prior.order_id)});if(!priorRow||priorRow.user_id!==user.id||priorRow.environment!==c.mode)throw Error('Registration record mismatch');const verified=prior.paid?{paid:true}:await confirm(c,priorRow);if(verified.paid)return json({paid:true,order_id:prior.order_id,environment:c.mode,registration:await rpc('studio_registration_status',{owner_id:user.id,env:c.mode})});}}
   const row=body.plan==='registration'?await rpc('studio_registration_reserve',{owner_id:user.id,env:c.mode,consent:body.consent_version}):await rpc('studio_payment_reserve',{owner_id:user.id,env:c.mode,requested_plan:body.plan});
   const orderId='apn_'+row.id;
   if(row.session_id)return json({order_id:orderId,payment_session_id:row.session_id,environment:c.mode,amount_paise:row.amount_paise});
   const order=await cashfree(c,'/orders',{method:'POST',headers:{'x-idempotency-key':row.id},body:JSON.stringify({order_id:orderId,order_amount:row.amount_paise/100,order_currency:'INR',order_expiry_time:new Date(Date.parse(row.created_at)+30*60000).toISOString(),customer_details:{customer_id:user.id,customer_email:user.email,customer_phone:phone},order_meta:{return_url:origin+'/cartoon-video-creation/membership.html?order_id='+orderId,notify_url:base+'/functions/v1/studio-payments?action=webhook'}})});
   if(order.order_id!==orderId||!order.payment_session_id)throw Error('Invalid checkout response');
   await rpc('studio_payment_session',{order_uuid:row.id,session_value:order.payment_session_id});
   return json({order_id:orderId,payment_session_id:order.payment_session_id,environment:c.mode,amount_paise:row.amount_paise});
  }
  if(action==='confirm'){
   const id=orderUUID(body.order_id),row=await rpc('studio_payment_order',{order_uuid:id});if(!row||row.user_id!==user.id||row.environment!==c.mode)return json({error:'Order unavailable for this account/environment'},404);
   return json(await confirm(c,row));
  }
  return json({error:'Unknown action'},400);
 }catch(error){return json({error:error instanceof Error?error.message:'Payment check failed'},action==='webhook'?503:400);}
});

