(()=>{
  if('serviceWorker' in navigator)addEventListener('load',async()=>{try{const registration=await navigator.serviceWorker.register('./service-worker.js?v=20260927-2',{updateViaCache:'none'});registration.update().catch(()=>{})}catch{}});
  const header=document.querySelector('body>header');if(!header)return;
  const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  if(document.getElementById('apanamInstallApp'))return;
  let promptEvent=null;
  const button=document.createElement('button');
  button.type='button';button.id='apanamInstallApp';button.textContent='⬇ Install App';
  button.title='APANAMai STUDIO को अपने फोन या कंप्यूटर पर install करें';
  const actions=header.querySelector('.header-utility-actions');(actions||header).append(button);
  const updateButton=()=>{button.hidden=installed()};
  updateButton();
  const help=document.createElement('dialog');
  help.id='apanamInstallHelp';
  help.setAttribute('aria-label','Install App निर्देश');
  help.innerHTML='<div class="apanam-install-head"><strong>⬇ APANAMai STUDIO Install करें</strong><button type="button" aria-label="बंद करें" id="apanamInstallClose">×</button></div><p id="apanamInstallInstructions"></p><button type="button" id="apanamInstallDone">ठीक है</button>';
  document.body.append(help);
  const close=()=>help.close();
  help.querySelector('#apanamInstallClose').onclick=close;
  help.querySelector('#apanamInstallDone').onclick=close;
  help.addEventListener('click',event=>{if(event.target===help)close()});
  addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;updateButton()});
  button.onclick=async()=>{
    if(installed()){updateButton();return}
    if(promptEvent){
      const event=promptEvent;promptEvent=null;
      event.prompt();
      const choice=await event.userChoice;
      if(choice?.outcome==='accepted')updateButton();
      return;
    }
    const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);
    const instructions=ios
      ?'Safari में नीचे Share (□↑) दबाएँ, फिर “Add to Home Screen” चुनें। Chrome में हों तो यही वेबसाइट Safari में खोलें।'
      :'Browser का ⋮ मेनू खोलें और “Install app” या “Add to Home screen” चुनें। Chrome में वेबसाइट खोलने पर install विकल्प उपलब्ध हो सकता है।';
    help.querySelector('#apanamInstallInstructions').textContent=instructions;
    if(!help.open)help.showModal();
  };
  addEventListener('appinstalled',()=>{promptEvent=null;updateButton()});
})();