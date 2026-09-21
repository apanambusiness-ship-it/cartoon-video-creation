(()=>{
  if(document.querySelector('.apanam-mobile-bar'))return;
  const poster=document.getElementById('stage'),video=document.getElementById('screen');if(!poster&&!video)return;
  const bar=document.createElement('nav');bar.className='apanam-mobile-bar';bar.setAttribute('aria-label','मोबाइल क्विक टूल्स');
  const item=(icon,label,action)=>{const button=document.createElement('button');button.type='button';button.innerHTML=`<span>${icon}</span><small>${label}</small>`;button.onclick=action;bar.append(button)};
  if(poster){
    item('⌂','Home',()=>document.getElementById('apanamCreatorHubButton')?.click());
    item('T','Text',()=>document.querySelector('[data-add="text"]')?.click());
    item('🖼','Photo',()=>document.getElementById('imageUpload')?.click());
    item('▣','Projects',()=>document.getElementById('loadProject')?.click());
    item('↓','Download',()=>document.getElementById('download')?.click());
  }else{
    item('＋','Scene',()=>document.getElementById('add')?.click());
    item('▶','Preview',()=>document.getElementById('preview')?.click());
    item('■','Stop',()=>document.getElementById('stop')?.click());
    item('▣','Gallery',()=>document.getElementById('openVideoGallery')?.click());
    item('↓','Export',()=>document.getElementById('export')?.click());
  }
  document.body.append(bar);
})();
