// Authenticated prepaid Shubh; no automatic provider retries.
const origin='https://apanambusiness-ship-it.github.io';
function mapped(n:string,f:string){try{return JSON.parse(Deno.env.get(n)||'{}').default||Deno.env.get(f)||'';}catch{return Deno.env.get(f)||'';}}
const base=Deno.env.get('SUPABASE_URL')||'',service=mapped('SUPABASE_SECRET_KEYS','SUPABASE_SERVICE_ROLE_KEY'),anon=mapped('SUPABASE_PUBLISHABLE_KEYS','SUPABASE_ANON_KEY');
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'};
const json=(v:unknown,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{...headers,'Content-Type':'application/json'}});
const serverHeaders={apikey:service,...(service.split('.').length===3?{Authorization:'Bearer '+service}:{}),'Content-Type':'application/json'};
async function rpc(n:string,v:unknown){const r=await fetch(base+'/rest/v1/rpc/'+n,{method:'POST',headers:serverHeaders,body:JSON.stringify(v),signal:AbortSignal.timeout(10000)});const d=await r.json();if(!r.ok)throw Error(d.message||'Database unavailable');return d;}
async function bounded(req:Request){const reader=req.body?.getReader();let size=0;const chunks:Uint8Array[]=[];if(!reader)return '{}';for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();throw Error('Request too large');}chunks.push(value);}const data=new Uint8Array(size);let i=0;for(const c of chunks){data.set(c,i);i+=c.length;}return new TextDecoder('utf-8',{fatal:true}).decode(data);}
Deno.serve(async(req:Request)=>{
 if(req.headers.get('origin')&&req.headers.get('origin')!==origin)return json({error:'Origin denied'},403);
 if(req.method==='OPTIONS')return new Response(null,{headers});if(req.method!=='POST')return json({error:'POST required'},405);
 try{
  const auth=req.headers.get('authorization')||'';if(!auth.startsWith('Bearer '))return json({error:'Login required'},401);
  const ur=await fetch(base+'/auth/v1/user',{headers:{apikey:anon,Authorization:auth},signal:AbortSignal.timeout(10000)}),user=await ur.json();if(!ur.ok||!user.id||user.is_anonymous||!user.email_confirmed_at)return json({error:'Verified account required'},401);
  const env=Deno.env.get('STUDIO_PAID_VOICE_MODE')||'production';if(!['sandbox','production'].includes(env))throw Error('Invalid mode');
  const key=Deno.env.get('SARVAM_API_KEY'),on=Deno.env.get('STUDIO_PAID_VOICE_ENABLED')==='true';
  const cfg=await rpc('studio_paid_voice_quote',{character_count:1});
  const settings=await fetch(base+'/rest/v1/studio_business_settings?select=ai_enabled&id=eq.true',{headers:serverHeaders,signal:AbortSignal.timeout(10000)});if(!settings.ok)throw Error('Business config unavailable');const flags=await settings.json();
  let admin=false;if(env==='sandbox'){const r=await fetch(base+'/rest/v1/studio_admins?select=user_id&user_id=eq.'+encodeURIComponent(user.id),{headers:serverHeaders,signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Admin check failed');admin=(await r.json()).length===1;}
  const enabled=!!key&&on&&(env==='sandbox'?admin:cfg.enabled&&flags[0]?.ai_enabled===true),action=new URL(req.url).searchParams.get('action');
  if(action==='status')return json({enabled,environment:env,pricing_version:'shubh-100-v1',unit_characters:100,unit_paise:cfg.charge_paise,message:enabled?'Shubh: ₹1 प्रति शुरू हुए 100 अक्षर, हर scene अलग।':'Public Shubh भुगतान का activation बाकी है। Admin voice परीक्षण अलग उपलब्ध है।'});
  const body=JSON.parse(await bounded(req)),text=String(body.text||'').trim(),language=String(body.language_code||'hi-IN');
  if(!text||[...text].length>220||!['hi-IN','bn-IN','gu-IN','kn-IN','ml-IN','mr-IN','od-IN','pa-IN','ta-IN','te-IN','en-IN'].includes(language))return json({error:'सही भाषा और 1–220 अक्षर रखें।'},400);
  const quote=await rpc('studio_paid_voice_quote',{character_count:[...text].length});
  if(action==='quote')return json({...quote,enabled,environment:env});
  if(action!=='generate')return json({error:'Unknown action'},400);
  const id=String(body.request_id||'');if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)||!Number.isSafeInteger(body.maximum_paise)||body.maximum_paise<1||body.pricing_version!=='shubh-100-v1')return json({error:'Approved quote required'},400);
  // Existing results are retrievable even when new requests are disabled.
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('sarvam/bulbul:v3/shubh|'+language+'|1|'+text)))).map(b=>b.toString(16).padStart(2,'0')).join('');
  if(!enabled){const previous=await rpc('studio_paid_voice_existing',{owner_id:user.id,env,request_id:id,digest:hash});if(!previous)return json({error:'Paid voice अभी बंद है।'},403);if(previous.state==='ready')return await audio(previous,user.id);return json({error:'Request '+previous.state+' है। नई request न बनाएँ।'},409);}
  const job=await rpc('studio_paid_voice_claim',{owner_id:user.id,env,request_id:id,digest:hash,character_count:[...text].length,language,maximum_paise:body.maximum_paise});
  if(!job.claimed){if(job.state==='ready')return await audio(job,user.id);return json({error:'Request '+job.state+' है। Provider को दोबारा नहीं भेजा गया।'},409);}
  try{
   const r=await fetch('https://api.sarvam.ai/text-to-speech',{method:'POST',headers:{'api-subscription-key':key!,'Content-Type':'application/json'},body:JSON.stringify({text,language_code:language,speaker:'shubh',model:'bulbul:v3',pace:1,speech_sample_rate:24000,output_audio_codec:'wav'}),signal:AbortSignal.timeout(45000)});
   if(!r.ok){await rpc('studio_paid_voice_finish',{job_id:job.id,outcome:r.status>=500?'uncertain':'failed'});return json({error:r.status>=500?'Provider outcome अस्पष्ट; राशि reserve है।':'आवाज़ नहीं बनी; reserved राशि वापस की गई।'},502);}
   const data=await r.json(),encoded=data.audios?.[0];if(typeof encoded!=='string'||encoded.length>2666668)throw Error('UnusableAudio');
   const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));if(bytes.length<44||bytes.length>2000000||new TextDecoder().decode(bytes.slice(0,4))!=='RIFF'||new TextDecoder().decode(bytes.slice(8,12))!=='WAVE')throw Error('UnusableAudio');
   let duration;try{duration=wavDuration(bytes);}catch{throw Error('UnusableAudio');}if(duration<=0||duration>14.7){await rpc('studio_paid_voice_finish',{job_id:job.id,outcome:'failed'});return json({error:'Scene की आवाज़ 14.7 सेकंड से अधिक है। Text छोटा करें; reserved राशि वापस की गई।'},422);}
   const path=user.id+'/'+job.id+'.wav',saved=await fetch(base+'/storage/v1/object/studio-paid-voices/'+path,{method:'POST',headers:{...serverHeaders,'Content-Type':'audio/wav'},body:bytes,signal:AbortSignal.timeout(15000)});if(!saved.ok)throw Error('Storage failed');
   await rpc('studio_paid_voice_finish',{job_id:job.id,outcome:'ready'});
   return new Response(bytes,{headers:{...headers,'Content-Type':'audio/wav'}});
  }catch(e){const unusable=e instanceof Error&&e.message==='UnusableAudio';await rpc('studio_paid_voice_finish',{job_id:job.id,outcome:unusable?'failed':'uncertain'}).catch(()=>{});return json({error:unusable?'Provider audio नहीं चली; reserved राशि वापस की गई।':'Provider outcome की जाँच जरूरी; राशि reserve है। इसी कहानी को retry करें, नई request न बनाएँ।'},502);}
 }catch(e){return json({error:e instanceof Error?e.message:'Voice unavailable'},400);}
});
async function audio(job:any,owner:string){if(job.user_id!==owner||job.result_path!==owner+'/'+job.id+'.wav')throw Error('Result ownership mismatch');const r=await fetch(base+'/storage/v1/object/authenticated/studio-paid-voices/'+job.result_path,{headers:serverHeaders,signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Stored audio unavailable');return new Response(r.body,{headers:{...headers,'Content-Type':'audio/wav'}});}

function wavDuration(bytes:Uint8Array){const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let rate=0,data=0;for(let p=12;p+8<=bytes.length;){const name=new TextDecoder().decode(bytes.slice(p,p+4)),size=view.getUint32(p+4,true);if(p+8+size>bytes.length)throw Error('Truncated WAV');if(name==='fmt '&&size>=16){const format=view.getUint16(p+8,true);if(![1,3,65534].includes(format))throw Error('Unsupported WAV');rate=view.getUint32(p+16,true);}if(name==='data')data+=size;p+=8+size+(size%2);}if(!rate||!data)throw Error('Incomplete WAV');return data/rate;}
