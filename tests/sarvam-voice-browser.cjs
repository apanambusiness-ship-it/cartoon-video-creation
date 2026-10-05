const fs=require('fs'),http=require('http'),assert=require('assert'),{chromium}=require('playwright');
(async()=>{
fs.mkdirSync('quality-artifacts',{recursive:true});
const html=fs.readFileSync('cartoon-video.html','utf8').replace(/<script[\s\S]*?<\/script>/g,'').replace(/<link[^>]*>/g,'');
const server=http.createServer((req,res)=>res.end(html));await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port);
for(const script of ['video-recording-formats.js','cartoon-video.js','video-photo-story.js','video-text-audio.js'])await page.addScriptTag({content:fs.readFileSync(script,'utf8')});
await page.evaluate(()=>{window.voiceCalls=[];window.voiceEnabled=true;window.APANAM_CLOUD={user:()=>({id:'admin-test'}),sarvamVoice:async(action,value)=>{if(action==='status')return {enabled:window.voiceEnabled,message:window.voiceEnabled?'Admin ready':'Activation pending'};window.voiceCalls.push(value);const samples=new Float32Array(48000);for(let i=0;i<samples.length;i++)samples[i]=.15*Math.sin(i*2*Math.PI*440/24000);return APANAM_TEXT_AUDIO.wav(samples);}};APANAM_CARTOON_PROJECT.restore([{title:'',caption:'छोटी सी मदद बड़ी खुशी देती है।',duration:1}]);});
await page.addScriptTag({content:fs.readFileSync('video-sarvam-voice.js','utf8')});
await page.waitForFunction(()=>!document.getElementById('shubhGenerate').disabled);
await page.click('#shubhGenerate');assert.equal(await page.evaluate(()=>voiceCalls.length),0);assert((await page.locator('#shubhStatus').innerText()).includes('checkbox'));await page.check('#shubhConsent');await page.click('#shubhGenerate');await page.waitForFunction(()=>document.getElementById('shubhStatus').textContent.startsWith('Shubh आवाज़ तैयार'));
const result=await page.evaluate(async()=>({duration:APANAM_CARTOON_PROJECT.snapshot()[0].duration,name:APANAM_CARTOON_PROJECT.snapshotSceneAudio()[0].name,bytes:Array.from(new Uint8Array(await APANAM_CARTOON_PROJECT.snapshotSceneAudio()[0].arrayBuffer())),id:voiceCalls[0].request_id}));
assert(result.duration>1);assert(result.name.endsWith('.wav'));assert(Buffer.from(result.bytes).subarray(0,4).toString()==='RIFF');
await page.click('#shubhGenerate');await page.waitForFunction(()=>document.getElementById('shubhStatus').textContent.startsWith('Shubh आवाज़ तैयार'));assert.equal(await page.evaluate(()=>voiceCalls[1].request_id),result.id);
await page.locator('#shubhLanguage').selectOption('bn-IN');await page.click('#shubhGenerate');await page.waitForFunction(()=>document.getElementById('shubhStatus').textContent.startsWith('Shubh आवाज़ तैयार'));assert.equal(await page.evaluate(()=>voiceCalls[2].language_code),'bn-IN');assert.notEqual(await page.evaluate(()=>voiceCalls[2].request_id),result.id);

await page.evaluate(()=>{const scenes=Array.from({length:35},(_,i)=>({title:i===0?'':'Scene '+(i+1),caption:i===0?'':'कहानी '+(i+1),duration:4,backgroundImage:'data:image/png;base64,photo'+i}));APANAM_CARTOON_PROJECT.restore(scenes);const clips=scenes.map((_,i)=>new File(['old-'+i],'old-'+i+'.wav',{type:'audio/wav'}));APANAM_CARTOON_PROJECT.restoreSceneAudio(clips);window.beforeScenes=JSON.stringify(APANAM_CARTOON_PROJECT.snapshot());window.beforeClips=APANAM_CARTOON_PROJECT.snapshotSceneAudio();});
assert.equal(await page.locator('#shubhScenes option').count(),7);
await page.click('#shubhGenerate');assert((await page.locator('#shubhStatus').innerText()).includes('Scene 1'));assert.equal(await page.evaluate(()=>voiceCalls.length),3);
await page.locator('#shubhScenes').selectOption('30');await page.click('#shubhGenerate');await page.waitForFunction(()=>document.getElementById('shubhStatus').textContent.startsWith('Shubh आवाज़ तैयार'));
const grouped=await page.evaluate(()=>({count:APANAM_CARTOON_PROJECT.snapshot().length,unchanged:JSON.stringify(APANAM_CARTOON_PROJECT.snapshot())===beforeScenes,preserved:APANAM_CARTOON_PROJECT.snapshotSceneAudio().slice(0,30).every((f,i)=>f===beforeClips[i]),names:APANAM_CARTOON_PROJECT.snapshotSceneAudio().slice(30).map(f=>f.name),calls:voiceCalls.length}));
assert.equal(grouped.count,35);assert(grouped.unchanged);assert(grouped.preserved);assert.equal(grouped.calls,8);assert.deepEqual(grouped.names,Array.from({length:5},(_,i)=>'Shubh-scene-'+(31+i)+'.wav'));

await page.evaluate(()=>{window.voiceEnabled=false;document.dispatchEvent(new Event('apanam-cloud-session'));});await page.waitForFunction(()=>document.getElementById('shubhStatus').textContent==='Activation pending');assert(await page.locator('#shubhGenerate').isDisabled());assert(!(await page.locator('#shubhConsent').isChecked()));
await page.click('#shubhRefresh');await page.waitForFunction(()=>document.getElementById('shubhStatus').textContent==='Activation pending');assert(await page.locator('#shubhGenerate').isDisabled());
await page.screenshot({path:'quality-artifacts/shubh-voice.png',fullPage:true});console.log('PASS: mocked Shubh WAV scene import, full audio timing, stable retry ID and account/activation gates');
}finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exit(1)});
