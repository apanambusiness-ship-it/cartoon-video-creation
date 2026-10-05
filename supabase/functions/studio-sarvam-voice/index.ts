// Admin-only pilot. Paid customer activation is deliberately separate.
const origin='https://apanambusiness-ship-it.github.io';
Deno.serve(async(req:Request)=>{
 const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store'};
 const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...headers,'Content-Type':'application/json'}});
 if(req.headers.get('origin')&&req.headers.get('origin')!==origin)return json({error:'Origin denied'},403);
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method!=='POST')return json({error:'POST required'},405);
 const base=Deno.env.get('SUPABASE_URL')||'',service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'',anon=Deno.env.get('SUPABASE_ANON_KEY')||'';
 const auth=req.headers.get('authorization')||'';
 const serverHeaders={apikey:service,Authorization:'Bearer '+service,'Content-Type':'application/json'};
 async function rpc(name:string,body:unknown){const r=await fetch(base+'/rest/v1/rpc/'+name,{method:'POST',headers:serverHeaders,body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});const d=await r.json();if(!r.ok)throw Error(d.message||'Database operation failed');return d;}
 try{
  if(!auth.startsWith('Bearer '))return json({error:'Login required'},401);
  const a=await fetch(base+'/auth/v1/user',{headers:{apikey:anon,Authorization:auth},signal:AbortSignal.timeout(10000)});const u=await a.json();
  if(!a.ok||!u.id||!u.email_confirmed_at)return json({error:'Verified login required'},401);
  const ar=await fetch(base+'/rest/v1/studio_admins?select=user_id&user_id=eq.'+encodeURIComponent(u.id),{headers:serverHeaders,signal:AbortSignal.timeout(10000)});
  if(!ar.ok)throw Error('Admin verification failed');const admins=await ar.json(),admin=admins.length===1;
  const key=Deno.env.get('SARVAM_API_KEY'),enabled=admin&&!!key&&Deno.env.get('STUDIO_SARVAM_PILOT_ENABLED')==='true';
  const action=new URL(req.url).searchParams.get('action');
  if(action==='status')return json({enabled,admin,pilot:true,voice:'shubh',message:!admin?'Shubh आवाज़ अभी Admin परीक्षण में है।':!key?'Sarvam API key server पर जोड़ना बाकी है।':!enabled?'Admin voice परीक्षण का activation बाकी है।':'Admin परीक्षण: Sarvam provider credits लगेंगे; user AI balance से कोई शुल्क नहीं।'});
  if(action!=='generate')return json({error:'Unknown action'},400);
  if(!enabled)return json({error:'Shubh voice pilot अभी active नहीं है।'},403);
  const raw=await req.text();if(new TextEncoder().encode(raw).length>4096)return json({error:'Request too large'},413);
  const body=JSON.parse(raw),text=String(body.text||'').trim(),requestId=String(body.request_id||''),language=body.language_code===undefined?'hi-IN':String(body.language_code);
  if(!['hi-IN','bn-IN','gu-IN','kn-IN','ml-IN','mr-IN','od-IN','pa-IN','ta-IN','te-IN','en-IN'].includes(language))return json({error:'यह voice भाषा अभी उपलब्ध नहीं है।'},400);
  if(!text||[...text].length>220||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId))return json({error:'Scene text 1–220 अक्षर रखें।'},400);
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('shubh|'+language+'|1|'+text)))).map(b=>b.toString(16).padStart(2,'0')).join('');
  const job=await rpc('studio_voice_pilot_claim',{owner:u.id,request_uuid:requestId,digest:hash}),path=u.id+'/'+job.id+'.wav';
  if(!job.claimed){if(job.state==='ready'){const r=await fetch(base+'/storage/v1/object/authenticated/studio-voice-pilots/'+path,{headers:serverHeaders,signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Stored audio unavailable');return new Response(r.body,{headers:{...headers,'Content-Type':'audio/wav'}})}return json({error:'यह request '+job.state+' है। Provider को दोबारा request नहीं भेजी गई।'},409);}
  let sent=false;
  try{
   sent=true;
   const r=await fetch('https://api.sarvam.ai/text-to-speech',{method:'POST',headers:{'api-subscription-key':key!,'Content-Type':'application/json'},body:JSON.stringify({text,language_code:language,speaker:'shubh',model:'bulbul:v3',pace:1,speech_sample_rate:24000,output_audio_codec:'wav'}),signal:AbortSignal.timeout(45000)});
   if(!r.ok){await rpc('studio_voice_pilot_finish',{pilot_id:job.id,outcome:r.status>=500?'uncertain':'failed'});return json({error:'Sarvam request असफल ('+r.status+')। Automatic retry नहीं हुई।'},502);}
   const answer=await r.json(),encoded=answer.audios?.[0];if(typeof encoded!=='string'||encoded.length>2700000)throw Error('Invalid audio');
   const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
   if(new TextDecoder().decode(bytes.slice(0,4))!=='RIFF'||new TextDecoder().decode(bytes.slice(8,12))!=='WAVE')throw Error('Invalid WAV');
   const saved=await fetch(base+'/storage/v1/object/studio-voice-pilots/'+path,{method:'POST',headers:{...serverHeaders,'Content-Type':'audio/wav'},body:bytes,signal:AbortSignal.timeout(15000)});
   if(!saved.ok)throw Error('Audio storage failed');
   await rpc('studio_voice_pilot_finish',{pilot_id:job.id,outcome:'ready',path});
   return new Response(bytes,{headers:{...headers,'Content-Type':'audio/wav'}});
  }catch{await rpc('studio_voice_pilot_finish',{pilot_id:job.id,outcome:sent?'uncertain':'failed'}).catch(()=>{});return json({error:'Provider outcome की जाँच जरूरी है। उसी request को retry करें; नई paid request न बनाएँ।'},502);}
 }catch{return json({error:'Voice request नहीं खुली। Login और connection जाँचें।'},400);}
});
