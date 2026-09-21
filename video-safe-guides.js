(()=>{
  const area=document.querySelector('.canvas-area'),canvas=document.getElementById('screen');
  if(!area||!canvas)return;
  const toolbar=document.createElement('section');toolbar.className='video-guide-tools';toolbar.innerHTML=`<strong>📐 Video Guides</strong><button type="button" id="toggleVideoSafe">Safe Zone</button><button type="button" id="toggleVideoGrid">Grid</button><select id="videoGuidePreset" aria-label="Platform guide"><option value="general">सामान्य</option><option value="youtube">YouTube</option><option value="reel">Reel / Shorts</option><option value="square">Square Post</option></select><small>Guides केवल editor में दिखेंगे, export में नहीं।</small>`;
  area.insertBefore(toolbar,canvas);
  const wrap=document.createElement('div');wrap.className='video-canvas-wrap';canvas.before(wrap);wrap.append(canvas);
  const safe=document.createElement('div');safe.className='video-safe-overlay';safe.innerHTML='<span>SAFE ZONE</span>';const grid=document.createElement('div');grid.className='video-grid-overlay';wrap.append(safe,grid);
  const safeButton=toolbar.querySelector('#toggleVideoSafe'),gridButton=toolbar.querySelector('#toggleVideoGrid'),preset=toolbar.querySelector('#videoGuidePreset');
  function sync(){wrap.dataset.guide=preset.value;safe.hidden=!safeButton.classList.contains('active');grid.hidden=!gridButton.classList.contains('active');safeButton.setAttribute('aria-pressed',String(!safe.hidden));gridButton.setAttribute('aria-pressed',String(!grid.hidden))}
  safeButton.onclick=()=>{safeButton.classList.toggle('active');sync()};gridButton.onclick=()=>{gridButton.classList.toggle('active');sync()};preset.onchange=()=>{if(!safeButton.classList.contains('active'))safeButton.classList.add('active');sync()};
  sync();
})();