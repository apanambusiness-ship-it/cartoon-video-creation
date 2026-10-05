const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{stripTypeScriptTypes}=require('node:module'),{webcrypto}=require('crypto');
const R=(v,s=200)=>new Response(JSON.stringify(v),{status:s}),uuid=n=>'f623a490-664c-44c0-9900-'+String(n).padStart(12,'0'),owner=uuid(1);
function boot(file,env,fetch){let h;vm.runInNewContext(stripTypeScriptTypes(fs.readFileSync(file,'utf8')),{URL,Request,Response,TextEncoder,TextDecoder,Uint8Array,AbortSignal,crypto:webcrypto,atob,Deno:{env:{get:n=>env[n]},serve:f=>h=f},fetch});return (a,b={},t='good')=>h(new Request('https://edge.invalid/?action='+a,{method:'POST',headers:{Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify(b)}));}
(async()=>{
let enabled=true,outcome='ok',calls=0;const jobs=new Map(),objects=new Map(),wav=Buffer.alloc(100);wav.write('RIFF');wav.write('WAVE',8);
const voice=boot('supabase/functions/studio-paid-voice/index.ts',{SUPABASE_URL:'https://db.invalid',SUPABASE_SERVICE_ROLE_KEY:'service',SUPABASE_ANON_KEY:'anon',SARVAM_API_KEY:'sarvam',STUDIO_PAID_VOICE_ENABLED:'true'},async(url,o={})=>{
 if(url.includes('/auth/v1/user'))return o.headers.Authorization==='Bearer good'?R({id:owner,email_confirmed_at:'now'}):R({},401);
 if(url.includes('/studio_business_settings?'))return R([{ai_enabled:enabled}]);
 if(url.includes('/rpc/')){const b=JSON.parse(o.body),n=url.split('/rpc/')[1];if(n==='studio_paid_voice_quote')return R({charge_paise:Math.ceil(b.character_count/100)*100,enabled,pricing_version:'shubh-100-v1'});if(n==='studio_paid_voice_existing')return R(jobs.get(b.request_id)?.digest===b.digest?jobs.get(b.request_id):null);
 if(n==='studio_paid_voice_claim'){let j=jobs.get(b.request_id);if(j){if(j.digest!==b.digest)return R({message:'mismatch'},400);return R({...j,claimed:false});}if(b.maximum_paise<100)return R({message:'budget'},400);j={id:b.request_id,user_id:owner,state:'processing',digest:b.digest};jobs.set(b.request_id,j);return R({...j,claimed:true});}
 if(n==='studio_paid_voice_finish'){const j=jobs.get(b.job_id);j.state=b.outcome;j.result_path=owner+'/'+j.id+'.wav';return R(j);}}
 if(url==='https://api.sarvam.ai/text-to-speech'){calls++;const b=JSON.parse(o.body);assert.equal(b.speaker,'shubh');assert.equal(o.headers['api-subscription-key'],'sarvam');if(outcome==='timeout')throw Error('timeout');if(outcome==='fail')return R({},400);return R({audios:[wav.toString('base64')]});}
 if(url.includes('/storage/v1/object/')){assert(url.includes('studio-paid-voices/'+owner+'/'));const p=url.split('studio-paid-voices/')[1];if(o.method==='POST'){objects.set(p,o.body);return R({});}return new Response(objects.get(p));}throw Error(url);
});
const b=n=>({text:'नमस्ते',request_id:uuid(n),maximum_paise:100,pricing_version:'shubh-100-v1'});
assert.equal((await voice('status',{},'bad')).status,401);assert.equal((await voice('generate',{...b(10),maximum_paise:1})).status,400);assert.equal(calls,0);
assert.equal((await voice('generate',b(10))).status,200);assert.equal((await voice('generate',b(10))).status,200);assert.equal(calls,1);
assert.equal((await voice('generate',{...b(10),text:'अलग'})).status,400);assert.equal(calls,1);
enabled=false;assert.equal((await voice('generate',b(10))).status,200);assert.equal((await voice('generate',b(11))).status,403);enabled=true;
outcome='fail';assert.equal((await voice('generate',b(12))).status,502);assert.equal(jobs.get(uuid(12)).state,'failed');outcome='timeout';assert.equal((await voice('generate',b(13))).status,502);assert.equal(jobs.get(uuid(13)).state,'uncertain');assert.equal((await voice('generate',b(13))).status,409);assert.equal(calls,3);
assert.equal((await voice('generate',{...b(14),text:'अ'.repeat(221)})).status,400);
console.log('PASS paid voice Edge: verified Auth, budget, hash binding, private WAV, disabled retrieval, duplicate suppression, failed/uncertain outcomes');
const env={SUPABASE_URL:'https://db.invalid',SUPABASE_SERVICE_ROLE_KEY:'service',SUPABASE_ANON_KEY:'anon',CASHFREE_TEST_APP_ID:'app',CASHFREE_TEST_SECRET_KEY:'secret',STUDIO_SUBSCRIPTIONS_ENABLED:'true'};let row={id:uuid(20),user_id:owner,environment:'sandbox',first_charge_at:'2026-10-08T00:00:00Z',created_at:'2026-10-05T00:00:00Z',consent_version:'100-per-30-days-v1',cancel_key:uuid(21)},p=null,created=0,charged=0,cancelled=0,amount=100;
const sub=boot('supabase/functions/studio-subscriptions/index.ts',env,async(url,o={})=>{
 if(url.includes('/auth/v1/user'))return o.headers.Authorization==='Bearer good'?R({id:owner,email:'qa@example.invalid',email_confirmed_at:'now'}):R({},401);
 if(url.includes('/rpc/')){const b=JSON.parse(o.body),n=url.split('/rpc/')[1];if(n==='studio_subscription_list')return R([row]);if(n==='studio_subscription_record')return R(b.subscription_uuid===row.id?row:null);if(n==='studio_subscription_reserve')return R(row);if(n==='studio_subscription_sync'){row.provider_id=b.provider_reference;return R(row);}if(n==='studio_subscription_fulfill'){assert.equal(b.amount,10000);assert.equal(b.payment_type,'CHARGE');charged++;return R({paid:true});}}
 if(url.endsWith('/subscriptions')&&o.method==='POST'){created++;const b=JSON.parse(o.body);assert.equal(b.plan_details.plan_amount,100);assert.equal(b.plan_details.plan_intervals,30);assert.equal(b.authorization_details.authorization_amount_refund,true);p={...b,cf_subscription_id:'cf-s',authorisation_details:b.authorization_details,subscription_session_id:'session',subscription_status:'INITIALIZED',plan_details:{...b.plan_details,plan_recurring_amount:100}};return R(p);}
 if(url.endsWith('/manage')){assert.equal(JSON.parse(o.body).action,'CANCEL');assert.equal(o.headers['x-idempotency-key'],row.cancel_key);cancelled++;p.subscription_status='CANCELLED';return R(p);}
 if(url.endsWith('/payments'))return R([{payment_type:'AUTH',payment_status:'SUCCESS',payment_amount:1},...(p.subscription_status==='ACTIVE'?[{payment_type:'CHARGE',payment_status:'SUCCESS',payment_amount:amount,cf_payment_id:'cf-pay',cf_subscription_id:'cf-s',subscription_id:'aps_'+row.id,payment_schedule_date:row.first_charge_at}]:[])]);
 if(url.endsWith('/subscriptions/aps_'+row.id))return R(p);throw Error(url);
});
const consent={name:'Test Owner',phone:'9876543210',consent:true,consent_version:'100-per-30-days-v1'},id={subscription_id:'aps_'+row.id};
assert.equal((await sub('status',{},'bad')).status,401);assert.equal((await sub('create',{...consent,consent:false})).status,400);assert.equal(created,0);
assert.equal((await sub('create',consent)).status,200);assert.equal((await sub('create',consent)).status,200);assert.equal(created,1);assert.equal(charged,0);
assert.equal((await sub('confirm',id)).status,200);assert.equal(charged,0);p.subscription_status='ACTIVE';assert.equal((await sub('confirm',id)).status,200);assert.equal(charged,1);
amount=999;assert.equal((await sub('confirm',id)).status,400);assert.equal(charged,1);amount=100;p.plan_details.plan_recurring_amount=999;assert.equal((await sub('confirm',id)).status,400);p.plan_details.plan_recurring_amount=100;
assert.equal((await sub('webhook',{type:'SUBSCRIPTION_PAYMENT_SUCCESS',data:id})).status,401);assert.equal(charged,1);
env.STUDIO_SUBSCRIPTIONS_ENABLED='false';assert.equal((await sub('create',consent)).status,403);assert.equal((await sub('cancel',id)).status,200);assert.equal((await sub('cancel',id)).status,200);assert.equal(cancelled,1);
row.user_id=uuid(2);assert.equal((await sub('cancel',id)).status,404);
console.log('PASS AutoPay Edge: consent, server ₹100/30-day plan, reuse, AUTH exclusion, provider mismatch, fake webhook, cancel while disabled, account isolation');
})().catch(e=>{console.error(e);process.exitCode=1;});
