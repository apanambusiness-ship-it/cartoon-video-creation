(()=>{
  const $=id=>document.getElementById(id),canvas=$('screen'),ctx=canvas.getContext('2d');
  const fields=['title','caption','duration','background','character','motion'];
  const defaults={title:'पहला Scene',caption:'APANAM में आपका स्वागत है',duration:4,background:'#312e81',character:'#facc15',motion:'bounce'};
  let scenes=[],current=-1,playing=false,recorder=null,raf=0;
  try{const saved=JSON.parse(localStorage.getItem('apanam-cartoon-scenes')||'[]');if(Array.isArray(saved))scenes=saved.slice(0,100).map(s=>({...defaults,...s}))}catch{}
  if(!scenes.length)scenes=[{...defaults}];
  function save(){try{localStorage.setItem('apanam-cartoon-scenes',JSON.stringify(scenes))}catch{}}
  function scene(){return scenes[current]}
  function select(i){current=i;fields.forEach(k=>$(k).value=scene()[k]);list();draw(scene(),0)}
  function list(){const root=$('scenes');root.replaceChildren();scenes.forEach((s,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','listitem');b.className=i===current?'selected':'';b.textContent=`${i+1}. ${s.title||'Scene'} · ${s.duration}s`;b.onclick=()=>select(i);root.append(b)})}
  function wrapText(value,x,y,width,limit=3){ctx.textAlign='center';const words=String(value||'').split(/\s+/),lines=[''];for(const word of words){let n=lines.at(-1)+(lines.at(-1)?' ':'')+word;if(ctx.measureText(n).width>width&&lines.at(-1)&&lines.length<limit)lines.push(word);else lines[lines.length-1]=n}lines.forEach((line,i)=>ctx.fillText(line,x,y+i*52))}
  function draw(s,t){ctx.fillStyle=s.background;ctx.fillRect(0,0,1280,720);ctx.fillStyle='#ffffff22';ctx.fillRect(0,590,1280,130);
    const x=s.motion==='slide'?190+Math.min(1,t/Math.max(1,s.duration))*850:640;
    const y=s.motion==='bounce'?370-Math.abs(Math.sin(t*4))*85:370;
    ctx.fillStyle=s.character;ctx.beginPath();ctx.arc(x,y,110,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#172033';ctx.beginPath();ctx.arc(x-36,y-25,10,0,7);ctx.arc(x+36,y-25,10,0,7);ctx.fill();ctx.beginPath();ctx.arc(x,y+12,42,.1,Math.PI-.1);ctx.lineWidth=7;ctx.strokeStyle='#172033';ctx.stroke();
    ctx.fillStyle='#fff';ctx.font='bold 56px Arial,sans-serif';wrapText(s.title,640,100,1120,2);
    ctx.font='32px Arial,sans-serif';wrapText(s.caption,640,550,1080,2)
  }
  function total(){return scenes.reduce((n,s)=>n+Number(s.duration||1),0)}
  function frameAt(elapsed){let t=elapsed;for(const s of scenes){let d=Number(s.duration)||1;if(t<d)return {s,t};t-=d}return {s:scenes.at(-1),t:Number(scenes.at(-1).duration)||1}}
  function stop(){playing=false;cancelAnimationFrame(raf);if(recorder?.state==='recording')recorder.stop();recorder=null;$('status').textContent='रुका हुआ'}
  function play(exporting=false){if(playing)stop();const length=total();if(!length)return;playing=true;const start=performance.now();$('status').textContent=exporting?'Video बन रहा है…':'Preview चल रहा है…';
    function tick(now){if(!playing)return;const elapsed=(now-start)/1000;const {s,t}=frameAt(Math.min(elapsed,length-.001));draw(s,t);if(elapsed<length)raf=requestAnimationFrame(tick);else{playing=false;if(recorder?.state==='recording')recorder.stop();else $('status').textContent='Preview पूरा हुआ'}}raf=requestAnimationFrame(tick)
  }
  fields.forEach(k=>$(k).addEventListener('input',()=>{if(!scene())return;scene()[k]=k==='duration'?Math.min(15,Math.max(1,Number($(k).value)||1)):$(k).value;save();list();if(!playing)draw(scene(),0)}));
  $('add').onclick=()=>{scenes.push({...defaults,title:`Scene ${scenes.length+1}`});save();select(scenes.length-1)};
  $('remove').onclick=()=>{if(scenes.length===1){$('status').textContent='कम से कम एक scene रखें';return}scenes.splice(current,1);save();select(Math.min(current,scenes.length-1))};
  $('preview').onclick=()=>play();$('stop').onclick=()=>{stop();window.speechSynthesis?.cancel()};
  $('speak').onclick=()=>{if(!window.speechSynthesis){$('status').textContent='इस browser में voice preview उपलब्ध नहीं है';return}speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(scene().caption||scene().title);utterance.lang=/[\u0900-\u097f]/.test(utterance.text)?'hi-IN':/[\u0980-\u09ff]/.test(utterance.text)?'bn-IN':'en-IN';speechSynthesis.speak(utterance);$('status').textContent='Dialogue सुनाया जा रहा है'};
  $('export').onclick=()=>{if(playing)stop();if(!window.MediaRecorder||!canvas.captureStream){$('status').textContent='इस browser में WebM export उपलब्ध नहीं है';return}const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));if(!mime){$('status').textContent='इस browser में WebM export उपलब्ध नहीं है';return}
    const chunks=[];recorder=new MediaRecorder(canvas.captureStream(30),{mimeType:mime});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};recorder.onstop=()=>{if(!chunks.length){$('status').textContent='Export नहीं बन पाया';return}const url=URL.createObjectURL(new Blob(chunks,{type:mime})),a=document.createElement('a');a.href=url;a.download='APANAM-cartoon-video.webm';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);$('status').textContent='WebM video तैयार है';recorder=null};recorder.start();play(true)
  };
  select(0)
})();
