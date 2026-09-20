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
  shell.append(nav,search,panels);left.prepend(shell);
  let active='Templates';
  for(const [name] of groups){const button=document.createElement('button');button.type='button';button.textContent=name;button.dataset.group=name;button.onclick=()=>{active=name;search.value='';show()};nav.append(button);const panel=document.createElement('div');panel.className='organizer-panel';panel.dataset.group=name;panels.append(panel)}
  function category(title){return groups.find(([,pattern])=>new RegExp(pattern,'i').test(title))?.[0]||'Arrange'}
  function section(nodes,title){if(!nodes.length)return;const box=document.createElement('details');box.className='organizer-section';box.open=true;box.dataset.title=title;const summary=document.createElement('summary');summary.textContent=title;box.append(summary,...nodes);panels.querySelector(`[data-group="${category(title)}"]`).append(box)}
  function collect(aside){let nodes=[...aside.children].filter(n=>n!==shell);let current=[],heading=aside===left?'Create':'Tools';for(const node of nodes){
    if(node.tagName==='H3'){section(current,heading);current=[];heading=node.textContent.trim();node.remove();continue}
    if(node.tagName==='HR'){node.remove();continue}
    // Script-inserted feature blocks remain whole, including their handlers.
    if(node.querySelector?.('h3') && current.length){section(current,heading);current=[];heading=node.querySelector('h3').textContent.trim()}
    current.push(node);
  }section(current,heading)}
  collect(left);collect(right);
  function show(){const term=search.value.trim().toLowerCase();nav.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.group===active));panels.querySelectorAll('.organizer-panel').forEach(p=>p.hidden=!term&&p.dataset.group!==active);panels.querySelectorAll('.organizer-section').forEach(s=>{const match=!term||s.textContent.toLowerCase().includes(term);s.hidden=!match;if(term&&match)s.open=true})}
  search.addEventListener('input',show);show();
  // Scripts loaded asynchronously may add panels after the initial layout.
  const observer=new MutationObserver(()=>{const pending=[...left.children,...right.children].filter(n=>n!==shell);if(!pending.length)return;observer.disconnect();collect(left);collect(right);show();observer.observe(left,{childList:true});observer.observe(right,{childList:true})});
  observer.observe(left,{childList:true});observer.observe(right,{childList:true});
})();
