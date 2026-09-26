(()=>{
  if('serviceWorker' in navigator)addEventListener('load',async()=>{try{const registration=await navigator.serviceWorker.register('./service-worker.js?v=20260927-2',{updateViaCache:'none'});registration.update().catch(()=>{})}catch{}});
  const header=document.querySelector('body>header');if(!header)return;let promptEvent=null;
  if(document.getElementById('apanamInstallApp'))return;const button=document.createElement('button');button.type='button';button.id='apanamInstallApp';button.textContent='⬇ Install';button.hidden=true;button.title='APANAM Studio को इस device पर install करें';
  const actions=header.querySelector('.header-utility-actions');(actions||header).append(button);
  addEventListener('beforeinstallprompt',event=>{event.preventDefault();promptEvent=event;button.hidden=false});
  button.onclick=async()=>{if(!promptEvent)return;promptEvent.prompt();await promptEvent.userChoice;promptEvent=null;button.hidden=true};
  addEventListener('appinstalled',()=>{promptEvent=null;button.hidden=true});
})();
