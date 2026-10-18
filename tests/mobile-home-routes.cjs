const {chromium}=require('playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://test').pathname);const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end();}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch();fs.mkdirSync('quality-artifacts',{recursive:true});
try{for(const width of [320,390,768]){
const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({contentType:'application/json',body:'{}'}));
const p=await context.newPage();const errors=[];p.on('pageerror',e=>{errors.push(e.message);console.log('PAGEERROR',e.stack);});await p.goto(origin+'/index.html?preview=1');
await p.locator('#studioTemplateLibrary').waitFor({state:'attached'});await p.waitForFunction(()=>typeof document.getElementById('studioTemplateLibrary')?.onclick==='function');
const home=p.locator('#studioMobileHome');assert(await home.isVisible());
const design=()=>p.locator('#stage>.element').evaluateAll(es=>es.map(e=>({kind:e.dataset.kind,text:e.dataset.text||'',name:e.dataset.name||'',left:e.style.left,top:e.style.top,width:e.style.width,height:e.style.height,image:e.querySelector('img')?.alt||''})));
const canvas=await design();
const homeAgain=async()=>{await p.locator('#studioHomeReturn').tap();await home.waitFor({state:'visible'});assert.deepEqual(await design(),canvas,'Navigation must preserve the design');};
const library=p.locator('.studio-library-overlay');
const closeLibrary=async()=>{await library.locator('[data-close]').tap();await homeAgain();};
assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Home horizontal overflow');
await p.screenshot({path:`quality-artifacts/home-${width}.png`,fullPage:true});
await p.locator('#studioHomeMenu').tap();await p.locator('#studioMobileSheet').waitFor({state:'visible',timeout:5000}).catch(async e=>{console.log('MENU STATE',await p.evaluate(()=>({classes:document.body.className,status:document.getElementById('studioHomeStatus')?.textContent,sheet:document.getElementById('studioMobileSheet')?.outerHTML,home:document.getElementById('studioHomeMenu')?.outerHTML})));throw e;});await p.locator('#mobileSheetClose').tap();await homeAgain();console.log('PASS menu',width);
await p.locator('.studio-home-profile').tap();await p.waitForURL('**/membership.html');assert.equal(new URL(p.url()).pathname,'/membership.html');await p.goBack();await home.waitFor({state:'visible'});console.log('PASS profile and browser Back',width);
await p.locator('#studioHomeCreate').tap();await p.locator('.apanam-hub-overlay').waitFor({state:'visible'});await p.locator('[data-hub="close"]').tap();await homeAgain();
await p.locator('#studioHomeTemplateSearch').fill('दीपावली');await p.locator('#studioHomeTemplateSearch').press('Enter');await library.waitFor({state:'visible'});assert.equal(await p.locator('#studioTemplateSearch').inputValue(),'दीपावली');assert(await p.locator('.studio-template-card').count()>0);await closeLibrary();
await p.locator('#studioHomeTemplateFilter').tap();await library.waitFor({state:'visible'});assert.equal(await p.locator('#studioTemplateSearch').inputValue(),'दीपावली');await closeLibrary();
const expected=['त्योहार · वर्षभर','Business','Social','संस्था','Education','Product','Wedding','Birthday'];
for(let i=0;i<8;i++){await p.locator('.studio-home-categories button').nth(i).tap();await library.waitFor({state:'visible'});assert.equal(await p.locator('#studioTemplateCategory').inputValue(),expected[i]);assert.equal(await p.locator('#studioTemplateSearch').inputValue(),'');assert(await p.locator('.studio-template-card').count()>0,'Category '+expected[i]);await closeLibrary();}console.log('PASS all 8 category filters',width);
for(let i=0;i<8;i++){await p.locator('#studioHomeFeatured button').nth(i).tap();await library.waitFor({state:'visible'});assert(await p.locator('.studio-template-card').count()>0,'Featured '+i);await closeLibrary();}console.log('PASS all 8 featured cards',width);
for(const selector of ['#studioHomeAllCategories','#studioHomeTemplates','[data-home-nav="templates"]']){await home.locator(selector).tap();await library.waitFor({state:'visible'});assert.equal(await p.locator('#studioTemplateSearch').inputValue(),'');assert.equal(await p.locator('#studioTemplateCategory').inputValue(),'');await closeLibrary();}
await home.locator('[data-home-tool="size"]').tap();await p.locator('#studioPosterSizeDialog').waitFor({state:'visible'});await p.locator('[aria-label="Poster Size बंद करें"]').tap();await homeAgain();
await home.locator('[data-home-tool="text-image"]').tap();await p.locator('.apanam-hub-overlay').waitFor({state:'visible'});await p.locator('[data-hub="close"]').tap();await homeAgain();
// Cancellation must not send the user to the poster editor.
const chooser=p.waitForEvent('filechooser');await home.locator('[data-home-tool="upload"]').tap();const picker=await chooser;await picker.setFiles([]);assert(await home.isVisible());
for(const selector of ['.studio-home-quick [data-home-nav="designs"]','.studio-home-bottom [data-home-nav="designs"]']){await home.locator(selector).tap();await p.locator('.apanam-gallery-backdrop').waitFor({state:'visible'});await p.locator('.apanam-gallery-backdrop [data-action="close"]').tap();await homeAgain();}
await home.locator('[data-home-nav="chat"]').tap();await p.locator('dialog[open] .support-chat').waitFor({state:'visible'});assert(!(await p.locator('.apanam-hub-overlay').isVisible()));await p.locator('[data-support-close]').tap();await homeAgain();
await home.locator('[data-home-nav="home"]').tap();assert(await home.isVisible());
assert.deepEqual(errors,[]);console.log('PASS Create/Search/Filter/See All/4 Quick Tools/4 navigation/return/no canvas mutation',width);
await context.close();}
}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
