(()=>{
  const api=window.APANAM_CARTOON_PROJECT,music=document.querySelector('.video-music-cues');if(!api||!music||!window.indexedDB)return;
  const box=document.createElement('section');box.className='video-version-recovery';box.innerHTML=`<h2>🕘 Version Recovery</h2><p>बड़े बदलाव से पहले scene version सुरक्षित करें। Audio अलग रहेगा।</p><div class="pair"><button type="button" id="saveVideoVersion">＋ Version सेव करें</button><button type="button" id="refreshVideoVersions">↻ सूची</button></div><div class="video-version-list"></div><small id="versionStatus">अधिकतम 8 versions रखे जाएँगे।</small>`;music.after(box);
  const list=box.querySelector('.video-version-list'),status=box.querySelector('#versionStatus');let db;
  let opening;
  const open=()=>opening??=new Promise((resolve,reject)=>{
    const req=indexedDB.open('apanam-video-versions',1);
    const timer=setTimeout(()=>{opening=null;reject(new Error('Storage opening timed out'))},10000);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('versions'))req.result.createObjectStore('versions',{keyPath:'id',autoIncrement:true})};
    req.onsuccess=()=>{clearTimeout(timer);db=req.result;db.onversionchange=()=>{db.close();db=null;opening=null};resolve(db)};
    req.onerror=()=>{clearTimeout(timer);opening=null;reject(req.error)};
  });
  async function query(method,value,mode='readonly'){
    const database=await open();
    return new Promise((resolve,reject)=>{
      const tx=database.transaction('versions',mode),req=tx.objectStore('versions')[method](value);let result;
      req.onsuccess=()=>{result=req.result};
      tx.oncomplete=()=>resolve(result);
      tx.onabort=()=>reject(tx.error||new Error('Storage transaction aborted'));
      tx.onerror=()=>reject(tx.error||new Error('Storage transaction failed'));
    });
  }
  const all=async()=> (await query('getAll')).sort((a,b)=>b.id-a.id),remove=id=>query('delete',id,'readwrite');
  async function render(){try{const versions=await all();list.replaceChildren();if(!versions.length){list.textContent='अभी कोई version सेव नहीं है।';return}versions.forEach(version=>{const row=document.createElement('div');row.className='video-version-row';const info=document.createElement('span');info.innerHTML=`<b>${new Date(version.savedAt).toLocaleString('hi-IN')}</b><small>${version.scenes.length} scenes</small>`;const restore=document.createElement('button');restore.type='button';restore.textContent='खोलें';restore.onclick=()=>{if(!confirm('मौजूदा scenes बदलेंगे। Audio इस version में शामिल नहीं है। खोलें?'))return;if(api.restore(version.scenes)){api.restoreSettings(version.settings);status.textContent='पुराना scene version खुल गया। Audio अलग से चुनें।'}};const del=document.createElement('button');del.type='button';del.textContent='हटाएँ';del.onclick=async()=>{if(!confirm('यह saved version हटाएँ?'))return;try{await remove(version.id);await render()}catch(_){status.textContent='Version नहीं हटाया जा सका। फिर कोशिश करें।'}};row.append(info,restore,del);list.append(row)})}catch(_){status.textContent='Version storage नहीं खुला।'}}
  box.querySelector('#saveVideoVersion').onclick=async()=>{try{const database=await open(),tx=database.transaction('versions','readwrite');tx.objectStore('versions').add({savedAt:Date.now(),scenes:api.snapshot(),settings:api.snapshotSettings()});await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});const versions=await all();for(const old of versions.slice(8))await remove(old.id);status.textContent='नया scene version सेव हो गया।';render()}catch(_){status.textContent='Version सेव नहीं हुआ। Browser storage जाँचें।'}};box.querySelector('#refreshVideoVersions').onclick=render;render();
})();