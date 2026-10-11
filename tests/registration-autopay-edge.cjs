const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{stripTypeScriptTypes}=require('node:module'),{webcrypto}=require('crypto');
const owner='f623a490-664c-44c0-9900-000000000001',id='f623a490-664c-44c0-9900-000000000020',R=(b,s=200)=>new Response(JSON.stringify(b),{status:s});
function boot(path,env,fetch){let handler;vm.runInNewContext(stripTypeScriptTypes(fs.readFileSync(path,'utf8')),{URL,Request,Response,TextEncoder,TextDecoder,Uint8Array,AbortSignal,crypto:webcrypto,atob,Deno:{env:{get:n=>env[n]},serve:h=>handler=h},fetch});return async(a,b={})=>handler(new Request('https://edge.invalid/?action='+a,{method:'POST',headers:{Authorization:'Bearer user'},body:JSON.stringify(b)}));}
(async()=>{let reserved=0,created=0,registration=null,subscriptionProviderCalls=0;
const env={SUPABASE_URL:'https://db.invalid',SUPABASE_SERVICE_ROLE_KEY:'service',SUPABASE_ANON_KEY:'anon',CASHFREE_TEST_APP_ID:'key',CASHFREE_TEST_SECRET_KEY:'secret',STUDIO_PAYMENTS_ENABLED:'true',STUDIO_SUBSCRIPTIONS_ENABLED:'false'};
const pay=boot('supabase/functions/studio-payments/index.ts',env,async(url,o={})=>{
 if(url.endsWith('/auth/v1/user'))return R({id:owner,email:'qa@example.invalid',email_confirmed_at:'now'});
 if(url.includes('/studio_business_settings?'))return R([{payments_enabled:false}]);
 if(url.endsWith('/studio_registration_status'))return R(registration);
 if(url.endsWith('/studio_payment_reserve')){const b=JSON.parse(o.body);assert.equal(b.owner_id,owner);assert.equal(b.requested_plan,'registration');reserved++;return R({id,user_id:owner,created_at:new Date().toISOString(),amount_paise:1000});}
 if(url.endsWith('/studio_payment_order'))return R({id,user_id:owner,environment:'sandbox',amount_paise:1000});
 if(url.endsWith('/studio_payment_fulfill')){registration={order_id:'apn_'+id,paid:true};return R({paid:true});}
 if(url.endsWith('/orders/apn_'+id))return R({order_id:'apn_'+id,order_currency:'INR',order_amount:10,order_status:'PAID',customer_details:{customer_id:owner}});
 if(url.endsWith('/orders/apn_'+id+'/payments'))return R([{payment_status:'SUCCESS',payment_currency:'INR',payment_amount:10,cf_payment_id:'paid-prior'}]);
 if(url.endsWith('/studio_payment_session'))return R(null);
 if(url.endsWith('/orders')){created++;assert.equal(JSON.parse(o.body).order_amount,10);return R({order_id:'apn_'+id,payment_session_id:'session'});}
 throw Error(url);
});
assert.equal((await (await pay('status')).json()).registration_enabled,true,'one-time registration works while AutoPay is disabled');
assert.equal((await pay('create',{plan:'registration',phone:'123'})).status,400);
assert.equal((await pay('create',{plan:'registration',phone:'9876543210'})).status,200);
assert.equal(reserved,1);assert.equal(created,1);
registration={order_id:'apn_'+id,paid:false};
assert.equal((await (await pay('create',{plan:'registration',phone:'9876543210'})).json()).paid,true,'provider-paid registration is recovered');
assert.equal(created,1,'recovery does not charge again');
assert.equal((await (await pay('create',{plan:'registration',phone:'9876543210'})).json()).paid,true);
assert.equal(created,1);
assert.deepEqual((await (await pay('status')).json()).registration,registration);
env.STUDIO_PAYMENT_MODE='production';env.CASHFREE_LIVE_APP_ID='key';env.CASHFREE_LIVE_SECRET_KEY='secret';
assert.equal((await pay('create',{plan:'registration',phone:'9876543210'})).status,403,'live registration needs business activation');
env.STUDIO_PAYMENT_MODE='sandbox';
const sub=boot('supabase/functions/studio-subscriptions/index.ts',env,async(url)=>{
 if(url.endsWith('/auth/v1/user'))return R({id:owner,email_confirmed_at:'now'});
 if(url.includes('/subscriptions'))subscriptionProviderCalls++;
 throw Error(url);
});
assert.equal((await sub('create',{name:'Test Owner',phone:'9876543210',consent:true})).status,403,'new mandates stay disabled');
assert.equal(subscriptionProviderCalls,0,'no provider mandate created');
console.log('PASS one-time registration: AutoPay disabled, server price, paid recovery, live gate, new mandate rejected');
})().catch(e=>{console.error(e);process.exitCode=1;});
