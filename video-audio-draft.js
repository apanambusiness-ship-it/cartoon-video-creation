(()=>{'use strict';
const api=window.APANAM_CARTOON_PROJECT;if(!api)return;
const status=document.createElement('p');status.id='videoAudioDraftStatus';status.setAttribute('role','status');document.getElementById('status')?.before(status);
const fingerprint=()=>JSON.stringify(api.snapshot());let loading=true,timer,revision=0,connection;
function summary(extra=''){const count=api.snapshotSceneAudio().filter(Boolean).length,main=!!api.snapshotAudio();status.textContent=(main?'मुख्य audio जुड़ी है। ': '')+(count?count+'/'+api.snapshot().length+' scenes की आवाज़ export में जुड़ेगी।':'सीन की आवाज़ नहीं जुड़ी है।')+' '+extra;}
const db=()=>connection??=new Promise((resolve,reject)=>{const r=indexedDB.open('apanam-video-audio-draft',1);r.onupgradeneeded=()=>r.result.createObjectStore('draft');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('blocked'));});
async function query(mode,value){const database=await Promise.race([db(),new Promise((_,reject)=>setTimeout(()=>reject(Error('timeout')),8000))]);return new Promise((resolve,reject)=>{const tx=database.transaction('draft',mode),store=tx.objectStore('draft'),r=mode==='readonly'?store.get('current'):store.put(value,'current');let result;const timeout=setTimeout(()=>{try{tx.abort()}catch{}reject(Error('timeout'));},8000);r.onsuccess=()=>result=r.result;tx.oncomplete=()=>{clearTimeout(timeout);resolve(result);};tx.onabort=tx.onerror=()=>{clearTimeout(timeout);reject(tx.error||Error('draft'));};});}
async function save(){const value={scenes:fingerprint(),audio:api.snapshotAudio(),clips:api.snapshotSceneAudio()},bytes=(value.audio?.size||0)+value.clips.reduce((n,f)=>n+(f?.size||0),0);if(bytes>30000000){summary('Audio draft 30 MB से बड़ा है। पूरा Backup लें।');return;}try{await query('readwrite',value);summary('आवाज़ इस browser में सेव है। पूरा Backup भी रखें।');}catch{summary('आवाज़ अपने-आप सेव नहीं हुई। पूरा Backup लें।');}}
function changed(){revision++;summary();if(loading)return;clearTimeout(timer);timer=setTimeout(save,120);}
for(const method of ['restoreAudio','restoreSceneAudio']){const original=api[method];api[method]=function(...args){const result=original.apply(api,args);changed();return result;};}
document.addEventListener('apanam-scene-change',changed);
document.querySelector('.controls')?.addEventListener('change',changed);
document.getElementById('removeSceneAudio')?.addEventListener('click',changed);
const initial=fingerprint(),initialRevision=revision;
window.APANAM_VIDEO_AUDIO_READY=(async()=>{try{const value=await query('readonly');if(value&&revision===initialRevision&&fingerprint()===initial&&value.scenes===initial&&!api.snapshotAudio()&&!api.snapshotSceneAudio().some(Boolean)){api.restoreAudio(value.audio);api.restoreSceneAudio(value.clips);summary('सेव की हुई आवाज़ वापस खुली।');}else summary();}catch{summary('पूरा Backup से आवाज़ सुरक्षित रखें।');}finally{loading=false;if(revision!==initialRevision){clearTimeout(timer);timer=setTimeout(save,120);}}})();
window.APANAM_VIDEO_AUDIO_DRAFT={flush:async()=>{await window.APANAM_VIDEO_AUDIO_READY;clearTimeout(timer);await save();}};
})();