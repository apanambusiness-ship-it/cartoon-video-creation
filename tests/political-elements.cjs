const {chromium}=require('playwright');
const {spawn}=require('child_process');
const assert=require('node:assert/strict');
(async()=>{const server=spawn('python3',['-m','http.server','8765']);const browser=await chromium.launch({headless:true});try{
for(const width of [390,1280]){
const page=await browser.newPage({viewport:{width,height:900}});
await page.goto('http://127.0.0.1:8765/index.html');
await page.waitForFunction(()=>window.APANAM_CREATIVE&&window.APANAM_PROJECT);
await page.evaluate(()=>window.APANAM_CREATIVE.open('elements'));
await page.locator('#studioCreativeDialog [data-category="राजनीतिक पार्टी"]').click();
assert.equal(await page.locator('#studioCreativeDialog .creative-card').count(),9);
for(const image of await page.locator('#studioCreativeDialog .creative-card img').all()){await image.scrollIntoViewIfNeeded();assert(await image.evaluate(async i=>{await i.decode();return i.naturalWidth>0}));}
await page.locator('[data-creative-id="creative-el-party-bjp"]').click();
await page.locator('#studioCreativeDialog [data-apply]').click();
await page.waitForFunction(()=>!document.querySelector('#studioCreativeDialog').open);
const state=await page.evaluate(()=>{
const node=document.querySelector('#stage [data-creative-id="creative-el-party-bjp"]');const img=node?.querySelector('img');
if(!img?.src.startsWith('data:'))throw Error('Logo must be embedded');
if(!node.querySelector('.handle'))throw Error('Resize handles missing');
node.style.left='80px';node.style.width='150px';window.APANAM_PROJECT.save();return window.APANAM_PROJECT.snapshot();
});
await page.reload();await page.waitForFunction(()=>document.querySelector('#stage [data-creative-id="creative-el-party-bjp"]'));
assert.equal(await page.locator('#stage [data-creative-id="creative-el-party-bjp"]').evaluate(n=>n.style.width),'150px');
assert(await page.locator('#stage [data-creative-id="creative-el-party-bjp"] img').evaluate(i=>i.complete&&i.naturalWidth>0));
console.log('PASS',width,'nine party previews, embedded logo, resize handles and saved layer restoration');
await page.close();
}
}finally{await browser.close();server.kill();}})().catch(e=>{console.error(e);process.exit(1)});
