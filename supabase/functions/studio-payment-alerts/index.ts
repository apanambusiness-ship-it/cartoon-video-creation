// Admin-only live payment notifications. Secrets and recipients never reach clients.
const base=Deno.env.get('SUPABASE_URL')!;
function envKey(name:string,legacy:string){try{return JSON.parse(Deno.env.get(name)||'{}').default||Deno.env.get(legacy)||'';}catch{return Deno.env.get(legacy)||'';}}
const service=envKey('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY');
const json=(value:unknown,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
async function rpc(name:string,args:Record<string,unknown>){
 const headers:Record<string,string>={apikey:service,'Content-Type':'application/json'};
 if(service.startsWith('eyJ'))headers.Authorization='Bearer '+service;
 const response=await fetch(base+'/rest/v1/rpc/'+name,{method:'POST',headers,body:JSON.stringify(args),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Database request failed');
 return response.json();
}
Deno.serve(async(req:Request)=>{
 if(req.method!=='POST')return json({error:'POST required'},405);
 const supplied=req.headers.get('x-studio-cron-secret');
 if(!supplied||supplied.length<32)return json({error:'Unauthorized'},401);
 try{if(await rpc('studio_payment_alert_authorized',{supplied})!==true)return json({error:'Unauthorized'},401);}
 catch{return json({error:'Scheduler authentication unavailable'},503);}
 const key=Deno.env.get('BREVO_API_KEY'),from=Deno.env.get('STUDIO_REMINDER_FROM');
 if(!key||!from)return json({ready:false,accepted:0,error:'Email provider is not configured'},503);
 try{
 const rows=await rpc('studio_claim_payment_alerts',{});let accepted=0,failed=0,uncertain=0;
 for(const row of rows){
  let outcome='uncertain',messageId='',code='provider_outcome_unknown';
  try{
   const when=new Date(row.fulfilled_at).toLocaleString('en-IN',{timeZone:'Asia/Kolkata'});
   const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':key,'Content-Type':'application/json'},
    body:JSON.stringify({sender:{email:from,name:'APANAMai Studio'},to:[{email:row.recipient}],
    subject:'APANAMai: ₹'+(row.amount_paise/100).toFixed(2)+' payment सफल',
    textContent:'सफल Live payment की सूचना\nराशि: ₹'+(row.amount_paise/100).toFixed(2)+'\nयोजना: '+(row.plan==='registration'?'Registration / Trial':'Manual Membership')+'\nसमय (IST): '+when+'\nUser ID: '+row.user_id+'\nOrder ID: apn_'+row.order_id+'\nPayment ID: '+row.payment_id+'\n\nAdmin में देखें: https://apanambusiness-ship-it.github.io/cartoon-video-creation/admin.html#payments\nयह payment सफलता की सूचना है। Bank settlement अलग है।',
    headers:{idempotencyKey:'studio-payment-'+row.order_id}}),signal:AbortSignal.timeout(10000)});
   const answer=await response.json().catch(()=>({}));
   code='HTTP_'+response.status;
   if(response.ok&&typeof answer.messageId==='string'){outcome='accepted';messageId=answer.messageId;}
   else if(response.status>=400&&response.status<500){outcome='failed';}
  }catch{/* Ambiguous requests are never retried automatically. */}
  if(outcome==='accepted')accepted++;else if(outcome==='failed')failed++;else uncertain++;
  await rpc('studio_finish_payment_alert',{order_uuid:row.order_id,outcome,message_id:messageId,code});
 }
 return json({ready:true,accepted,failed,uncertain});
 }catch{return json({error:'Payment alert operation failed'},500);}
});
