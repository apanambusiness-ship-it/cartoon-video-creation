/* Organize existing controls without cloning or replacing them: listeners and IDs stay intact. */
(()=>{
  const left=document.querySelector('main > aside:not(.right)');
  const right=document.querySelector('main > aside.right');
  if(!left||!right)return;
  const groups=[['Templates','Templates|Original'],['Uploads','Upload'],['Text','Text|Typing|Language'],['Elements','Create|Element|Icon|Shape|Sticker'],['Product','Product|Marketplace|Price|Commerce|Delivery|Badge|Listing|Sale|Feature|Trust|Rating|Warranty|Stock|CTA|Festival'],['Brand','Brand|Logo'],['Background','Background|Canvas'],['Arrange','Align|Layer|Selection|Group|Layout|Precision|Position|Quick|Smart|View'],['Effects','Effect|Photo|Crop|Color|Image'],['Export','Export|Image Check|Safe Zone|Autosave|Keyboard']];
  const shell=document.createElement('div');shell.className='organizer';
  const nav=document.createElement('nav');nav.className='organizer-nav';nav.setAttribute('aria-label','Editor tools');
  const search=document.createElement('input');search.type='search';search.placeholder='Search tools';search.setAttribute('aria-label','Search tools');
  const panels=document.createElement('div');panels.className='organizer-panels';
  const videoLink=document.createElement('a');videoLink.href='cartoon-video.html';videoLink.className='organizer-video-link';videoLink.textContent='🎬 Cartoon Video Maker →';
  shell.append(nav,videoLink,search,panels);left.prepend(shell);
  let active='Text';
  for(const [name] of groups){const button=document.createElement('button');button.type='button';button.textContent=name;button.dataset.group=name;button.onclick=()=>{active=name;search.value='';show()};nav.append(button);const panel=document.createElement('div');panel.className='organizer-panel';panel.dataset.group=name;panels.append(panel)}
  function cleanTitle(title){return String(title||'Tools').replace(/^\s*\d+\s+/,'').replace(/\s+[—-]\s*\d+\s*$/,'').replace(/\s+/g,' ').trim()}
  function category(title){
    title=cleanTitle(title);
    if(/Template|Festival/i.test(title))return 'Templates';
    if(/Upload/i.test(title))return 'Uploads';
    if(/Image Check|Export|Download|Safe Zone|Autosave|Keyboard|Publish/i.test(title))return 'Export';
    if(/Brand|Logo/i.test(title))return 'Brand';
    if(/Background|Canvas/i.test(title))return 'Background';
    if(/Text|Typing|Language|Font/i.test(title))return 'Text';
    if(/Create|Element|Icon|Shape|Sticker/i.test(title))return 'Elements';
    if(/Creator Utility/i.test(title))return 'Elements';
    if(/Effect|Photo|Crop|Color|Image/i.test(title))return 'Effects';
    if(/Product|Marketplace|Price|Commerce|Delivery|Badge|Listing|Sale|Feature|Trust|Rating|Warranty|Stock|CTA/i.test(title))return 'Product';
    return groups.find(([,pattern])=>new RegExp(pattern,'i').test(title))?.[0]||'Arrange'
  }
  function section(nodes,title){
    if(!nodes.length)return;
    title=cleanTitle(title);
    if(/Original Templates/i.test(title)){
      panels.querySelectorAll('.organizer-section').forEach(old=>{
        if(/Original Templates/i.test(old.dataset.title||''))old.remove();
      });
      nodes.forEach(node=>{
        const repeated=node.matches?.('#originalTemplatesV1')?node.querySelector(':scope > h3'):null;
        if(repeated)repeated.remove();
      });
      title='🎨 Original Templates';
    }
    const panel=panels.querySelector(`[data-group="${category(title)}"]`);
    const box=document.createElement('details');box.className='organizer-section';box.open=!panel.querySelector('.organizer-section');box.dataset.title=title;
    const summary=document.createElement('summary');summary.textContent=title;
    box.addEventListener('toggle',()=>{if(!box.open)return;panel.querySelectorAll('.organizer-section').forEach(other=>{if(other!==box)other.open=false})});
    box.append(summary,...nodes);panel.append(box)
  }
  function collect(aside){let nodes=[...aside.children].filter(n=>n!==shell);let current=[],heading=aside===left?'Create':'Tools';for(const node of nodes){
    if(node.tagName==='H3'){section(current,heading);current=[];heading=node.textContent.trim();node.remove();continue}
    if(node.tagName==='HR'){node.remove();continue}
    // Script-inserted feature blocks remain whole, including their handlers.
    const ownHeading=node.querySelector?.(':scope > h3');
    if(ownHeading){section(current,heading);current=[];heading=ownHeading.textContent.trim();ownHeading.remove()}
    current.push(node);
  }section(current,heading)}
  collect(left);collect(right);
  function pinTextPanel(){
    const approved=document.querySelector('#apanamApprovedPanel');
    if(!approved||approved.closest('.organizer-panel[data-group="Text"]'))return;
    const box=document.createElement('details');box.className='organizer-section organizer-featured';box.open=true;box.dataset.title='Text & Elements · Phonetic Typing';
    const summary=document.createElement('summary');summary.textContent='Text & Elements · Phonetic Typing';
    box.append(summary,approved);panels.querySelector('[data-group="Text"]').prepend(box);
  }
  pinTextPanel();
  // Give uploads their own visible home while keeping the original input and listeners.
  const upload=document.querySelector('#imageUpload')?.closest('label');
  if(upload){const related=[upload,document.querySelector('#autoMakeEditable')].filter(Boolean);section(related,'Uploads')}
  function prune(){panels.querySelectorAll('.organizer-section').forEach(s=>{if(![...s.children].some(n=>n.tagName!=='SUMMARY'))s.remove()})}
  function show(){prune();const term=search.value.trim().toLowerCase();nav.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.group===active));panels.querySelectorAll('.organizer-panel').forEach(p=>p.hidden=!term&&p.dataset.group!==active);panels.querySelectorAll('.organizer-section').forEach(s=>{const match=!term||s.textContent.toLowerCase().includes(term);s.hidden=!match;if(term&&match)s.open=true})}
  search.addEventListener('input',show);show();
  // Scripts loaded asynchronously may add panels after the initial layout.
  const observer=new MutationObserver(()=>{const pending=[...left.children,...right.children].filter(n=>n!==shell);if(!pending.length)return;observer.disconnect();collect(left);collect(right);pinTextPanel();show();observer.observe(left,{childList:true});observer.observe(right,{childList:true})});
  observer.observe(left,{childList:true});observer.observe(right,{childList:true});
})();
