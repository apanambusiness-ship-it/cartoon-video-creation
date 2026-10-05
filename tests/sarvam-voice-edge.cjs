const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),{webcrypto}=require('crypto');
let handler,admin=true,providerCalls=0,mode='ok',enabled=true,expectedLanguage='hi-IN';const jobs=new Map(),objects=new Map();
const wav=Buffer.alloc(100);wav.write('RIFF');wav.write('WAVE',8);
const response=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json'}});
const sandbox={URL,Request,Response,TextEncoder,TextDecoder,Uint8Array,AbortSignal,crypto:webcrypto,atob,Deno:{env:{get:n=>({SUPABASE_URL:'https://db.invalid',SUPABASE_SERVICE_ROLE_KEY:'private-service',SUPABASE_ANON_KEY:'public',SARVAM_API_KEY:enabled?'private-sarvam':undefined,STUDIO_SARVAM_PILOT_ENABLED:'true'})[n]},serve:fn=>handler=fn},fetch:async(url,o={})=>{
if(url.includes('/auth/v1/user'))return o.headers.Authorization==='Bearer good'?response({id:'owner',email_confirmed_at:'now'}):response({},401);
if(url.includes('/studio_admins?'))return response(admin?[{user_id:'owner'}]:[]);
if(url.includes('/rpc/studio_voice_pilot_claim')){const b=JSON.parse(o.body);let j=jobs.get(b.request_uuid);if(j){if(j.input_hash!==b.digest)return response({message:'mismatch'},400);return response({...j,claimed:false});}j={id:b.request_uuid,state:'processing',input_hash:b.digest};jobs.set(b.request_uuid,j);return response({...j,claimed:true});}
if(url.includes('/rpc/studio_voice_pilot_finish')){const b=JSON.parse(o.body);const j=jobs.get(b.pilot_id);j.state=b.outcome;return response(null);}
if(url==='https://api.sarvam.ai/text-to-speech'){providerCalls++;assert.equal(o.headers['api-subscription-key'],'private-sarvam');const b=JSON.parse(o.body);assert.equal(b.speaker,'shubh');assert.equal(b.language_code,expectedLanguage);if(mode==='timeout')throw Error('timeout');if(mode==='fail')return response({},403);return response({audios:[wav.toString('base64')]});}
if(url.includes('/storage/v1/object/')){const key=url.split('studio-voice-pilots/')[1];if(o.method==='POST'){objects.set(key,o.body);return response({});}return new Response(objects.get(key));}
throw Error('Unexpected URL '+url);}};
let source=fs.readFileSync('supabase/functions/studio-sarvam-voice/index.ts','utf8').replace(/req:Request/g,'req').replace(/data:unknown/g,'data').replace(/name:string,body:unknown/g,'name,body').replace(/key!/g,'key');vm.runInNewContext(source,sandbox);
const call=(action,body={},token='good')=>handler(new Request('https://edge.invalid/?action='+action,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)}));
const id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0');
(async()=>{
assert.equal((await call('status',{},'bad')).status,401);
admin=false;assert.equal((await call('generate',{text:'नमस्ते',request_id:id(1)})).status,403);assert.equal(providerCalls,0);admin=true;
enabled=false;assert.equal((await call('generate',{text:'नमस्ते',request_id:id(1)})).status,403);enabled=true;
assert.equal((await call('generate',{text:'अ'.repeat(221),request_id:id(1)})).status,400);
let r=await call('generate',{text:'नमस्ते',request_id:id(1)});assert.equal(r.status,200);assert.equal(r.headers.get('Content-Type'),'audio/wav');assert.equal(providerCalls,1);
r=await call('generate',{text:'नमस्ते',request_id:id(1)});assert.equal(r.status,200);assert.equal(providerCalls,1);
assert.equal((await call('generate',{text:'अलग कहानी',request_id:id(1)})).status,400);assert.equal(providerCalls,1);
assert.equal((await call('generate',{text:'नमस्ते',request_id:id(1),language_code:'bn-IN'})).status,400);
assert.equal((await call('generate',{text:'नमस्ते',request_id:id(7),language_code:'ur-IN'})).status,400);
for(const [i,code] of ['bn-IN','gu-IN','kn-IN','ml-IN','mr-IN','od-IN','pa-IN','ta-IN','te-IN','en-IN'].entries()){expectedLanguage=code;assert.equal((await call('generate',{text:'sample',request_id:id(20+i),language_code:code})).status,200);}
expectedLanguage='hi-IN';providerCalls=1;mode='timeout';assert.equal((await call('generate',{text:'कहानी',request_id:id(2)})).status,502);assert.equal(jobs.get(id(2)).state,'uncertain');assert.equal((await call('generate',{text:'कहानी',request_id:id(2)})).status,409);assert.equal(providerCalls,2);
mode='fail';assert.equal((await call('generate',{text:'कहानी',request_id:id(3)})).status,502);assert.equal(jobs.get(id(3)).state,'failed');
console.log('PASS: verified Admin, activation gate, character limits, private output, duplicate suppression, hash binding, uncertain outcomes');
})().catch(e=>{console.error(e);process.exitCode=1;});
