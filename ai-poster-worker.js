// Separate Cloudflare Worker. Requires an AI binding named AI and a D1 binding named DB.
const MODEL='@cf/meta/llama-3.2-3b-instruct';
const ORIGIN='https://apanambusiness-ship-it.github.io';
function response(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','access-control-allow-origin':ORIGIN,'vary':'Origin','cache-control':'no-store'}})}
export default {async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/api/poster'&&request.method==='OPTIONS')return new Response(null,{status:204,headers:{'access-control-allow-origin':ORIGIN,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'Content-Type','vary':'Origin'}});
  if(url.pathname==='/health')return response({ready:!!env.AI&&!!env.DB});
  if(url.pathname!=='/api/poster'||request.method!=='POST')return response({error:'Not found'},404);
  if(request.headers.get('origin')!==ORIGIN)return response({error:'Origin not allowed'},403);
  if(!env.AI||!env.DB)return response({error:'AI setup अधूरा है'},503);
  if(Number(request.headers.get('content-length')||0)>4096)return response({error:'जानकारी बहुत लंबी है'},413);
  let body;try{body=await request.json()}catch{return response({error:'JSON भेजें'},400)}
  const product=String(body.product||'').trim().slice(0,80);
  const category=String(body.category||'').trim().slice(0,50);
  const brand=String(body.brand||'').trim().slice(0,40);
  const price=Number(body.price);
  if(!product||!Number.isSafeInteger(price)||price<1||price>99999999)return response({error:'Product और सही कीमत भरें'},400);
  const ip=request.headers.get('cf-connecting-ip')||'unknown';
  const ipHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const date=new Date().toISOString().slice(0,10);
  const use=async(key,maximum)=>env.DB.prepare('INSERT INTO ai_quota (key, used) VALUES (?1,1) ON CONFLICT(key) DO UPDATE SET used=used+1 WHERE used < ?2 RETURNING used').bind(date+':'+key,maximum).first();
  try{
    if(!(await use('global',80)))return response({error:'आज की मुफ्त AI सीमा पूरी है; कल फिर कोशिश करें'},429);
    if(!(await use(ipHash,3)))return response({error:'आज की आपकी 3 AI कोशिशें पूरी हैं'},429);
  }catch{return response({error:'AI उपयोग सीमा उपलब्ध नहीं है'},503)}
  try{
    const result=await env.AI.run(MODEL,{messages:[{role:'system',content:'You are a Hindi product poster designer. Return ONLY valid JSON with keys headline, tagline, offer, primaryColor, backgroundColor, style, template. Template must be one of listing, sale, beauty, home, handmade, festival. Headlines under 36 chars, tagline and offer under 55 chars. Colors must be #RRGGBB. No invented discounts, shipping promises, ratings or product claims. Use supplied facts only.'},{role:'user',content:JSON.stringify({product,category,brand,price})}],max_tokens:180,temperature:0.8});
    const raw=String(result.response||'').replace(/^```(?:json)?\s*|\s*```$/g,'').trim();
    const suggestion=JSON.parse(raw);
    const safe=(key,max)=>String(suggestion[key]||'').trim().slice(0,max);
    const color=(key,fallback)=>/^#[0-9a-fA-F]{6}$/.test(suggestion[key])?suggestion[key]:fallback;
    return response({headline:safe('headline',36)||product,tagline:safe('tagline',55),offer:safe('offer',55),primaryColor:color('primaryColor','#6d28d9'),backgroundColor:color('backgroundColor','#ffffff'),style:safe('style',35),template:['listing','sale','beauty','home','handmade','festival'].includes(suggestion.template)?suggestion.template:'listing'});
  }catch{return response({error:'AI अभी जवाब नहीं दे पाया; फिर कोशिश करें'},503)}
}};
