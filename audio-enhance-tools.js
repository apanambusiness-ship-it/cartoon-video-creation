(()=>{
  const audio=document.getElementById('audioFile');if(!audio)return;
  const box=document.createElement('div');box.className='audio-enhance-box';box.innerHTML=`<div class="pair"><label>Music शुरू करें (सेकंड)<input id="audioStart" type="number" min="0" max="3600" step="0.1" value="0"></label><label>Fade समय (सेकंड)<input id="audioFadeTime" type="number" min="0.2" max="3" step="0.1" value="0.8"></label></div><label class="check-option"><input id="fadeAudio" type="checkbox" checked> Audio में Fade-in और Fade-out लगाएँ</label>`;audio.closest('label').after(box);
})();
