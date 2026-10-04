const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({args:['--no-sandbox']});try{
for(const width of [360,1280]){
const page=await browser.newPage({viewport:{width,height:900}});
await page.route('https://calendar.test/**',r=>r.fulfill({contentType:r.request().url().endsWith('.json')?'application/json':'text/html',body:r.request().url().endsWith('.json')?JSON.stringify({events:[{id:'dussehra',title:'दशहरा',date:'2026-10-20',type:'festival'},{id:'birth',title:'सादर जयंती',date:'2026-10-20',type:'birth'},{id:'death',title:'स्मृति दिवस',date:'2026-10-20',type:'death'}]}):'<html><body></body></html>'}));
await page.goto('https://calendar.test/');
await page.addScriptTag({content:fs.readFileSync(path.join(root,'studio-catalog-core.js'),'utf8')});
await page.addScriptTag({content:fs.readFileSync(path.join(root,'studio-calendar.js'),'utf8')});
await page.evaluate(()=>APANAM_CALENDAR.ready);
const originals=JSON.parse(fs.readFileSync(path.join(root,'studio-original-templates.json'),'utf8')).templates;
const result=await page.evaluate(templates=>{
const posters=APANAM_CALENDAR.posters('2026-10-20',templates);
for(const poster of posters){const t=document.createElement('template');t.innerHTML=APANAM_CATALOG.project(poster.project).html;
for(const name of ['अवसर का नाम','शुभकामना','तारीख','संस्था','आपका नाम']){const e=t.content.querySelector('[data-name="'+name+'"]');if(!e?.classList.contains('text')||!e.dataset.text)throw Error('Missing editable '+name);e.textContent=e.dataset.text='बदला गया';}
localStorage.setItem(poster.id,JSON.stringify({...poster.project,html:t.innerHTML}));}
return {count:posters.length,ids:posters.map(p=>p.id),backgrounds:posters.slice(0,5).map(p=>p.project.html),art:posters[0].project.html.includes('dussehra.webp'),future:APANAM_CALENDAR.posters('2027-10-20',templates).length,invalid:APANAM_CALENDAR.posters('2026-02-30',templates).length};
},originals);
assert.equal(result.count,15);assert.equal(new Set(result.ids).size,15);assert.equal(new Set(result.backgrounds).size,5);assert.equal(result.art,true);assert.equal(result.future,0);assert.equal(result.invalid,0);
await page.reload();assert.equal(await page.evaluate(()=>Object.values(localStorage).filter(v=>v.includes('बदला गया')).length),15);
await page.addScriptTag({content:fs.readFileSync(path.join(root,'studio-calendar.js'),'utf8')});await page.evaluate(()=>APANAM_CALENDAR.ready);await page.evaluate(templates=>{document.body.style.margin='0';for(const poster of APANAM_CALENDAR.posters('2026-10-20',templates).slice(0,5)){const wrap=document.createElement('div'),canvas=document.createElement('div');wrap.style.cssText='width:100%;height:540px;overflow:hidden;margin-bottom:12px';canvas.style.cssText='position:relative;width:540px;height:540px;transform-origin:top left;transform:scale('+Math.min(1,innerWidth/540)+')';canvas.innerHTML=poster.project.html;wrap.style.height=(540*Math.min(1,innerWidth/540))+'px';wrap.append(canvas);document.body.append(wrap);}},originals);fs.mkdirSync(path.join(root,'quality-artifacts'),{recursive:true});await page.screenshot({path:path.join(root,'quality-artifacts','calendar-five-'+width+'.png'),fullPage:true});await page.close();console.log('PASS '+width+'px: five designs per event, matched artwork, editable fields, persistence, invalid date and no lunar repetition');
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
