const {chromium}=require('playwright'),assert=require('assert/strict'),path=require('path');
(async()=>{const browser=await chromium.launch({headless:true});try{
 const page=await browser.newPage();
 await page.route('https://studio.test/**',r=>r.fulfill({contentType:'text/html',body:'<main class="admin-main"><form id="memberLogin"></form></main>'}));
 await page.goto('https://studio.test/membership.html');
 await page.evaluate(()=>{
  window.calls=[];window.paid=false;
  window.APANAM_CLOUD={user:()=>({id:'owner'}),authReady:Promise.resolve(),paidMemberships:async()=>[],paymentRequest:async(a,b)=>{
   calls.push({a,b});
   if(a==='status')return {enabled:true,registration_enabled:true,configured:true,environment:'sandbox',registration:paid?{paid:true,order_id:'apn_test'}:null};
   if(a==='create')return {order_id:'apn_test',payment_session_id:'pay-session',environment:'sandbox'};
   throw Error(a);
  }};
  window.Cashfree=()=>({checkout:async b=>calls.push({a:'checkout',b}),subscriptionsCheckout:async()=>{throw Error('Unexpected mandate checkout');}});
 });
 await page.addScriptTag({path:path.resolve('studio-payments-ui.js')});
 await page.waitForFunction(()=>!document.getElementById('studioPaymentRefresh').disabled);
 assert.equal(await page.locator('#studioPaymentForm input[name=consent]').count(),0,'one-time payment needs no mandate consent');
 await page.selectOption('#studioPaymentForm select','registration');
 await page.fill('#studioPaymentForm input[name=phone]','9876543210');
 await page.click('#studioPayButton');
 await page.waitForFunction(()=>calls.some(x=>x.a==='checkout'));
 assert.equal(await page.evaluate(()=>calls.find(x=>x.a==='create').b.plan),'registration');
 assert.equal(await page.evaluate(()=>calls.filter(x=>x.a.startsWith('subscription-')).length),0);
 await page.evaluate(()=>paid=true);
 await page.click('#studioPaymentRefresh');
 await page.waitForFunction(()=>document.querySelector('#studioPaymentForm select').value==='manual');
 assert.equal(await page.evaluate(()=>calls.filter(x=>x.a==='create').length),1,'paid status does not buy registration twice');
 await page.evaluate(()=>document.dispatchEvent(new Event('apanam-cloud-session')));
 assert.equal(await page.locator('#studioPaymentForm input[name=phone]').inputValue(),'');
 console.log('PASS one-time registration UI: no mandate consent, ₹10 checkout, paid state moves to manual renewal, account reset');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
