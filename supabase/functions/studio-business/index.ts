// Uses only Supabase's built-in server environment variables. No secrets in the client.
const origin='https://apanambusiness-ship-it.github.io';
const base=Deno.env.get('SUPABASE_URL')!,service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!;
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-file-name,x-studio-cron-secret','Access-Control-Allow-Methods':'POST,OPTIONS','Cache-Control':'no-store','Content-Type':'application/json'};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
async function rest(path:string,options:RequestInit={},token=service){const r=await fetch(base+path,{...options,headers:{apikey:anon,Authorization:'Bearer '+token,...options.headers},signal:AbortSignal.timeout(20000)});let body;try{body=await r.json();}catch{body=null;}if(!r.ok)throw Error(body?.message||body?.msg||'Cloud operation failed');return body;}
const rpc=(name:string,args:Record<string,unknown>)=>rest('/rest/v1/rpc/'+name,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args)});
async function bounded(req:Request,maximum:number){const length=Number(req.headers.get('content-length'));if(length>maximum)throw Error('File too large');const reader=req.body?.getReader();if(!reader)throw Error('Empty file');let size=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>maximum){await reader.cancel();throw Error('File too large');}chunks.push(value);}const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length;}return result;}
function validateFile(bytes:Uint8Array,type:string){const first=String.fromCharCode(...bytes.slice(0,12));if(!bytes.length)throw Error('Empty file');const valid=type==='image/png'?bytes[0]===137&&first.slice(1,4)==='PNG':type==='image/jpeg'?bytes[0]===255&&bytes[1]===216:type==='image/webp'?first.startsWith('RIFF')&&first.slice(8,12)==='WEBP':type==='audio/wav'?first.startsWith('RIFF')&&first.slice(8,12)==='WAVE':type==='audio/ogg'?first.startsWith('OggS'):type==='audio/mpeg'?first.startsWith('ID3')||bytes[0]===255&&(bytes[1]&224)===224:type==='video/mp4'?first.slice(4,8)==='ftyp':type==='video/webm'?bytes[0]===26&&bytes[1]===69&&bytes[2]===223&&bytes[3]===163:type==='application/json';if(!valid)throw Error('File content does not match its type');if(type==='application/json')JSON.parse(new TextDecoder().decode(bytes));}
async function removeObject(path:string){return rest('/storage/v1/object/studio-private-media',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({prefixes:[path]})});}
Deno.serve(async(req:Request)=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return json({error:'POST required'},405);
 try{
  const url=new URL(req.url),action=url.searchParams.get('action')||'status';
  const supplied=req.headers.get('x-studio-cron-secret'),cronSecret=Deno.env.get('STUDIO_CRON_SECRET');
  const cron=action==='send-reminders'&&!!cronSecret&&cronSecret.length>=32&&supplied===cronSecret;
  let user:{id:string,email_confirmed_at?:string,is_anonymous?:boolean}|null=null;const token=(req.headers.get('authorization')||'').replace(/^Bearer /i,'');
  if(!cron){if(!token)return json({error:'Login required'},401);try{user=await rest('/auth/v1/user',{},token);}catch{return json({error:'Session invalid. Login again.'},401);}if(!user?.id)return json({error:'Login required'},401);}
  if(action==='status'){return json({media:true,email_configured:!!Deno.env.get('BREVO_API_KEY')&&!!Deno.env.get('STUDIO_REMINDER_FROM'),sms_configured:false,paid_ai_configured:false,payments_enabled:false});}
  if(['upload','download','delete'].includes(action)&&(!user?.email_confirmed_at||user.is_anonymous))return json({error:'Verified email account required'},403);
  if(action==='upload'){
   const type=(req.headers.get('content-type')||'').split(';')[0],bytes=await bounded(req,10485760);validateFile(bytes,type);
   let title:string;try{title=decodeURIComponent(req.headers.get('x-file-name')||'Media');}catch{throw Error('Invalid file name');}title=title.replace(/[\r\n/\\]/g,' ').trim().slice(0,120)||'Media';
   const row=await rpc('studio_media_reserve',{owner_id:user!.id,file_title:title,file_bytes:bytes.length,file_mime:type}),path=user!.id+'/'+row.id;
   try{await rest('/storage/v1/object/studio-private-media/'+path,{method:'POST',headers:{'Content-Type':type,'x-upsert':'false','cache-control':'no-store'},body:bytes});await rpc('studio_media_state',{owner_id:user!.id,file_id:row.id,next_status:'ready'});return json({file:{...row,status:'ready'}});}
   catch(error){await rpc('studio_media_state',{owner_id:user!.id,file_id:row.id,next_status:'uncertain'}).catch(()=>{});throw error;}
  }
  if(action==='download'||action==='delete'){
   const body=JSON.parse(new TextDecoder().decode(await bounded(req,2048))),id=String(body.id||'');if(!/^[0-9a-f-]{36}$/i.test(id))throw Error('Invalid file');const path=user!.id+'/'+id;
   if(action==='download'){const row=await rpc('studio_media_download',{owner_id:user!.id,file_id:id});const file=await fetch(base+'/storage/v1/object/authenticated/studio-private-media/'+path,{headers:{apikey:anon,Authorization:'Bearer '+service},signal:AbortSignal.timeout(30000)});if(!file.ok)throw Error('Stored file unavailable. Cloud quota remains reserved.');return new Response(file.body,{headers:{...headers,'Content-Type':row.mime,'Content-Disposition':"attachment; filename*=UTF-8''"+encodeURIComponent(row.title)}});}
   await rpc('studio_media_state',{owner_id:user!.id,file_id:id,next_status:'deleting'});await removeObject(path);await rpc('studio_media_state',{owner_id:user!.id,file_id:id,next_status:'deleted'});return json({deleted:true});
  }
  if(action==='send-reminders'){
   if(!cron){const admins=await rest('/rest/v1/studio_admins?select=user_id&user_id=eq.'+user!.id,{},token);if(!admins.length)return json({error:'Admin required'},403);}
   const key=Deno.env.get('BREVO_API_KEY'),from=Deno.env.get('STUDIO_REMINDER_FROM');if(!key||!from)return json({ready:false,sent:0,message:'Brevo API key और verified sender जोड़ें। कोई message नहीं भेजा गया।'});
   const rows=await rpc('studio_claim_reminders',{});let accepted=0,uncertain=0;
   for(const row of rows){const expiry=new Date(row.expires_at).toLocaleDateString('hi-IN',{timeZone:'Asia/Kolkata'});try{
    const r=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':key,'Content-Type':'application/json'},body:JSON.stringify({sender:{email:from,name:'APANAMai Studio'},to:[{email:row.email}],subject:row.days_left===0?'APANAMai membership की अवधि':'APANAMai membership reminder',textContent:'आपके मुफ्त Manual Access / Trial की समाप्ति तारीख '+expiry+' है।\nस्थिति और reminder preference: https://apanambusiness-ship-it.github.io/cartoon-video-creation/membership.html\nRenewal के लिए admin से संपर्क करें। Payment अभी सक्रिय नहीं है।',headers:{idempotencyKey:row.id}}),signal:AbortSignal.timeout(15000)});
    const answer=await r.json().catch(()=>({}));if(r.ok){await rpc('studio_finish_reminder',{reminder_id:row.id,outcome:'sent',message_id:answer.messageId||''});accepted++;}else{await rpc('studio_finish_reminder',{reminder_id:row.id,outcome:'failed',message_id:'HTTP '+r.status});}
   }catch{uncertain++;await rpc('studio_finish_reminder',{reminder_id:row.id,outcome:'uncertain',message_id:'Provider outcome unknown. Do not resend automatically.'}).catch(()=>{});}}
   return json({ready:true,accepted,uncertain,message:'Accepted का अर्थ provider ने request स्वीकार की; inbox delivery की पुष्टि अलग है।'});
  }
  return json({error:'Unknown action'},400);
 }catch(error){return json({error:error instanceof Error?error.message:'Cloud operation failed'},400);}
});
