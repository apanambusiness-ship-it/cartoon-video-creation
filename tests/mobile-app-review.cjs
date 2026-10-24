// Offline fixtures only: no sign-in, purchase, messages or user projects.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'quality-artifacts');
const pages=['index.html','poster-editor.html','cartoon-video.html','membership.html','admin.html','about.html','privacy.html','terms.html','refund-cancellation.html','delete-account.html','ADMIN-OPERATIONS-GUIDE.html','PRIVATE-BACKUP-GUIDE.html'];
const server=http.createServer((req,res)=>{try{const f=path.resolve(root,'.'+new URL(req.url,'http://test').pathname);if(!f.startsWith(root+path.sep))throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.statusCode=404;res.end();}});
(async()=>{fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch(),report=[],failures=[];
try{for(const width of [320,360,390,430,768])for(const file of pages){const c=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({contentType:'application/json',body:'{}'}));const p=await c.newPage();p.setDefaultTimeout(8000);const errors=[];p.on('pageerror',e=>{if(!e.message.includes("Service worker is disabled because the context is sandboxed"))errors.push(e.stack||e.message)});p.on('dialog',d=>d.dismiss());
const capture=async label=>{const scan=await p.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,controls:[...document.querySelectorAll('button,a,summary,input,select,textarea')].filter(e=>e.getClientRects().length&&!e.closest('[hidden]')).map(e=>{const r=e.getBoundingClientRect();return{id:e.id,label:(e.getAttribute('aria-label')||e.textContent||e.getAttribute('placeholder')||e.tagName).trim().slice(0,100),x:r.x,y:r.y,width:r.width,height:r.height,font:getComputedStyle(e).fontSize};})}));report.push({file,width,label,...scan,errors:[...errors]});assert(scan.documentWidth<=width+2,`${file} ${label} horizontal overflow: ${scan.documentWidth}/${width}`);if(width===390||width===320)await p.screenshot({path:path.join(out,`mobile-review-${width}-${file.replace('.html','')}-${label}.png`),fullPage:true});};
try{await p.goto(origin+'/'+file+'?preview=1');if(['index.html','poster-editor.html'].includes(file))await p.waitForFunction(()=>window.APANAM_FLOATING_TEXT&&document.querySelector('#studioTemplateLibrary')?.onclick);await capture('home');
if(file==='index.html'){
 await p.locator('#studioHomeTemplateSearch').tap();assert(await p.locator('#studioFloatingText').isHidden(),'Search must not open phonetic typing');
 const chooser=p.waitForEvent('filechooser');await p.locator('[data-home-tool="upload"]').tap();const picked=await chooser;await picked.setFiles(path.join(root,'apanam-app-icon-192.png'));await p.waitForFunction(()=>!!document.querySelector('#stage .element img[src^="data:"]'));await capture('editor');
 for(const group of ['Templates','Uploads','Text','Elements','Product','Brand','Background','Arrange','Effects','Export']){
  await p.locator('.apanam-mobile-bar [aria-label="Tools"]').tap();await p.locator('.organizer-nav').getByRole('button',{name:group,exact:true}).tap();await capture('tools-'+group);if(await p.locator('#studioCreativeDialog').isVisible())await p.locator('#studioCreativeDialog [data-close]').tap();if(await p.locator('#studioMobileToolsClose').isVisible())await p.locator('#studioMobileToolsClose').tap();
 }
 await p.locator('#studioMobileAllActions').tap();for(const name of ['Design','Editing','अन्य','सभी']){await p.locator('#studioMobileActionTabs').getByRole('button',{name,exact:true}).tap();await capture('menu-'+name);}await p.locator('#mobileSheetClose').tap();
 for(const id of ['saveProject','loadProject','undo','redo']){const r=await p.locator('#'+id).boundingBox();assert(r&&r.height>=39&&r.x>=0&&r.x+r.width<=width,`${id} visible and reachable`);}
}
if(file==='membership.html'){
 await p.locator('#studioMemberNavigation button').first().waitFor({state:'attached'});
 const targets=await p.locator('#studioMemberNavigation button').evaluateAll(es=>es.filter(e=>!e.hidden).map(e=>e.dataset.target));
 assert(targets.length>=5,'Account navigation is populated');
 for(const id of targets){
  const toggle=p.locator('#memberVerticalMenu>summary');
  if(!(await p.locator('#studioMemberNavigation').isVisible()))await toggle.tap();
  await p.locator('#studioMemberNavigation button[data-target="'+id+'"]').tap();
  assert(await p.locator('#'+id).isVisible(),'Account option opens '+id);
  await capture('account-'+id);
 }

}
if(file==='cartoon-video.html'){for(const tab of await p.locator('#videoWorkspaceNav button').all()){await tab.tap();await capture('video-'+await tab.getAttribute('data-workspace'));}}
assert.equal(errors.length,0,errors.join('\n'));
}catch(e){failures.push({file,width,error:e.message});await p.screenshot({path:path.join(out,`failure-${width}-${file}.png`),fullPage:true}).catch(()=>{});}finally{await c.close();}}
}finally{await browser.close();server.close();fs.writeFileSync(path.join(out,'mobile-app-review.json'),JSON.stringify({report,failures},null,2));}console.log(JSON.stringify({screens:report.length,failures},null,2));assert.equal(failures.length,0,'Mobile review failures');})().catch(e=>{console.error(e);server.close();process.exitCode=1});
