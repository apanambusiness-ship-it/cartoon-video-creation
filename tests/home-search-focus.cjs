const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{try{const f=path.resolve(root,'.'+new URL(req.url,'http://test').pathname);if(!f.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.statusCode=404;res.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,b=await chromium.launch();fs.mkdirSync('quality-artifacts',{recursive:true});try{
 for(const width of [320,390,768]){
  const c=await b.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({contentType:'application/json',body:'{}'}));const p=await c.newPage();p.setDefaultTimeout(10000);const errors=[];p.on('pageerror',e=>{if((e.stack||'').includes('floating-text-edit.js'))errors.push(e.message);});
  await p.goto(origin+'/index.html?preview=1');await p.waitForFunction(()=>window.APANAM_FLOATING_TEXT&&document.body.classList.contains('studio-mobile-layout'));
  const cards=()=>p.locator('#studioMobileHome [data-home-category]').evaluateAll(es=>es.map(e=>({text:e.textContent,html:e.innerHTML,category:e.dataset.homeCategory})));
  const design=()=>p.locator('#stage>.element').evaluateAll(es=>es.map(e=>({kind:e.dataset.kind,text:e.dataset.text,name:e.dataset.name,left:e.style.left,top:e.style.top,width:e.style.width,height:e.style.height,image:e.querySelector('img')?.alt})));
  const originalCards=await cards(),originalDesign=await design();
  const search=p.locator('#studioHomeTemplateSearch');const panel=p.locator('#studioFloatingText');
  await search.tap();assert(await panel.isHidden(),'Search must not open phonetic editor');
  await search.fill('Diwali birthday');assert.equal(await search.inputValue(),'Diwali birthday');assert(await panel.isHidden());
  const focus=await search.evaluate(e=>{const input=getComputedStyle(e),box=getComputedStyle(e.closest('.studio-home-search'));return {outline:input.outlineStyle,boxOutline:box.outlineStyle,boxRadius:parseFloat(box.borderTopLeftRadius),focused:document.activeElement===e};});
  console.log('FOCUS',JSON.stringify(focus),await p.evaluate(()=>({width:innerWidth,media:matchMedia('(max-width:900px)').matches,styles:[...document.styleSheets].filter(s=>s.href?.includes('studio-home-stable')).map(s=>({href:s.href,rules:[...s.cssRules].map(r=>r.cssText).slice(-2)}))})));assert(focus.focused);assert.equal(focus.outline,'none');assert.equal(focus.boxOutline,'solid');assert(focus.boxRadius>0,'Focus outline follows the rounded Search container');
  await p.screenshot({path:`quality-artifacts/home-search-${width}.png`,fullPage:true});
  assert.deepEqual(await cards(),originalCards,'All original Home cards remain unchanged');assert.deepEqual(await design(),originalDesign,'Search leaves poster layers untouched');
  // Existing editor API must still open phonetic editing for a real text layer.
  await p.evaluate(()=>{const layer=document.querySelector('#stage .element[data-text]');if(!layer)throw Error('Text fixture missing');window.APANAM_FLOATING_TEXT.open(layer);});
  assert(await panel.isVisible(),'Poster phonetic editing still opens');
  await search.focus();assert(await panel.isHidden(),'Returning to Search closes any stale phonetic box');assert.equal(await search.inputValue(),'Diwali birthday');
  assert.deepEqual(await design(),originalDesign);assert.deepEqual(errors,[]);
  console.log(`PASS ${width}: Search typing; rounded focus; no phonetic popup; original cards and poster unchanged; editor phonetic preserved`);await c.close();
 }
}finally{await b.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
