/* Organize existing controls without cloning or replacing them: listeners and IDs stay intact. */
(()=>{
  const left=document.querySelector('main > aside:not(.right)');
  const right=document.querySelector('main > aside.right');
  if(!left||!right)return;
  const groups=[['Templates','Templates|Original'],['Uploads','Upload'],['Text','Text|Typing|Language'],['Elements','Create|Element|Icon|Shape|Sticker'],['Product','Product|Marketplace|Price|Commerce|Delivery|Badge|Listing|Sale|Feature|Trust|Rating|Warranty|Stock|CTA|Festival'],['Brand','Brand|Logo'],['Background','Background|Canvas'],['Arrange','Align|Layer|Selection|Group|Layout|Precision|Position|Quick|Smart|View'],['Effects','Effect|Photo|Crop|Color|Image'],['Export','Export|Image Check|Safe Zone|Autosave|Keyboard']];
  const descriptions={Templates:'तैयार डिज़ाइन',Uploads:'अपनी फोटो जोड़ें',Text:'लिखाई और फ़ॉन्ट',Elements:'आकृतियाँ और आइकन',Product:'उत्पाद और कीमत',Brand:'लोगो और पहचान',Background:'कैनवास और पृष्ठभूमि',Arrange:'लेयर और जगह',Effects:'फोटो के प्रभाव',Export:'डाउनलोड और जाँच'};
  const searchTools=window.APANAM_TOOL_SEARCH;
  const shell=document.createElement('div');shell.className='organizer';
  const nav=document.createElement('nav');nav.className='organizer-nav';nav.setAttribute('aria-label','Editor tools');
  const search=document.createElement('input');search.type='search';search.dataset.studioToolSearch='1';search.placeholder='Tools खोजें · फोटो, Font, रंग';search.setAttribute('aria-label','Search tools');search.setAttribute('aria-describedby','organizerStatus');
  const feedback=document.createElement('div');feedback.className='organizer-feedback';
  const status=document.createElement('p');status.id='organizerStatus';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const clear=document.createElement('button');clear.type='button';clear.className='organizer-clear';clear.textContent='खोज हटाएँ';clear.hidden=true;
  feedback.append(status,clear);
  const panels=document.createElement('div');panels.className='organizer-panels';
  const empty=document.createElement('p');empty.className='organizer-empty';empty.textContent='कोई tool नहीं मिला। छोटा शब्द लिखें, जैसे फोटो, रंग या Font।';empty.hidden=true;panels.append(empty);
  const videoLink=document.createElement('a');videoLink.href='cartoon-video.html';videoLink.className='organizer-video-link';videoLink.textContent='🎬 Cartoon Video Maker →';
  shell.append(nav,videoLink,search,feedback,panels);left.prepend(shell);
  let active='Text';
  let searching=false;
  const openBeforeSearch=new Map();
  for(const [name] of groups){const button=document.createElement('button');button.type='button';button.textContent=name;button.dataset.group=name;button.title=descriptions[name];button.id='organizerGroup'+name;button.setAttribute('aria-controls','organizerPanel'+name);button.onclick=()=>{active=name;search.value='';show();panels.scrollTop=0};nav.append(button);const panel=document.createElement('div');panel.className='organizer-panel';panel.dataset.group=name;panel.id='organizerPanel'+name;panel.setAttribute('role','region');panel.setAttribute('aria-labelledby',button.id);const heading=document.createElement('p');heading.className='organizer-group-label';heading.textContent=name+' · '+descriptions[name];heading.hidden=true;panel.append(heading);panels.append(panel)}
  function cleanTitle(title){return String(title||'Tools').replace(/^\s*\d+\s+/,'').replace(/\s+[—-]\s*\d+\s*$/,'').replace(/\s+/g,' ').trim()}
  function category(title){
    title=cleanTitle(title);
    if(/Category Detail|How To Use|In The Box|Pack Contents|Size \/ Dimensions|Payment Info|Specification Cards|Offer & Promotion|Packaging Info|Pricing & Saving|Bulk Creative|Seasonal & Campaign|Certification & Authenticity|Category Creative/i.test(title))return 'Product';
    if(/Watermark & Ownership/i.test(title))return 'Brand';
    if(/Accessibility & Readability/i.test(title))return 'Text';
    if(/Creative Search & Organize/i.test(title))return 'Templates';
    if(/AI Creative Assist/i.test(title))return 'Elements';
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
    const existing=[...panel.querySelectorAll('.organizer-section')].find(item=>item.dataset.title===title);
    if(existing){existing.append(...nodes);return}
    const box=document.createElement('details');box.className='organizer-section';box.open=!panel.querySelector('.organizer-section');box.dataset.title=title;
    const summary=document.createElement('summary');summary.textContent=title;
    box.addEventListener('toggle',()=>{if(!box.open||search.value.trim())return;panel.querySelectorAll('.organizer-section').forEach(other=>{if(other!==box)other.open=false})});
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
    if(approved?.dataset.topToolbar==='1')return;
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
  function searchable(section){
    // Attribute labels include controls whose visible text is only an icon.
    const labels=[...section.querySelectorAll('[aria-label],[title],[placeholder]')].map(el=>[el.getAttribute('aria-label'),el.getAttribute('title'),el.getAttribute('placeholder')].filter(Boolean).join(' '));
    return [section.dataset.title,section.textContent,...labels].join(' ');
  }
  function show(){
    prune();const term=search.value.trim(),sections=[...panels.querySelectorAll('.organizer-section')];
    if(term){for(const section of sections)if(!openBeforeSearch.has(section))openBeforeSearch.set(section,section.open);}
    else if(searching){for(const [section,wasOpen]of openBeforeSearch)if(section.isConnected)section.open=wasOpen;openBeforeSearch.clear();}
    searching=!!term;
    nav.querySelectorAll('button').forEach(b=>{const selected=!term&&b.dataset.group===active;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});
    let count=0;
    for(const section of sections){const match=!term||(searchTools?searchTools.matches(searchable(section),term):searchable(section).toLowerCase().includes(term.toLowerCase()));section.hidden=!match;if(term&&match){section.open=true;count++;}}
    panels.querySelectorAll('.organizer-panel').forEach(panel=>{panel.hidden=term?![...panel.querySelectorAll('.organizer-section')].some(s=>!s.hidden):panel.dataset.group!==active;panel.querySelector('.organizer-group-label').hidden=!term;});
    clear.hidden=!term;empty.hidden=!term||count>0;
    status.textContent=term?count+' tool समूह मिले · सभी categories':descriptions[active]+' · '+panels.querySelector('[data-group="'+active+'"]').querySelectorAll('.organizer-section').length+' समूह';
  }
  clear.onclick=()=>{search.value='';show();search.focus();};
  search.addEventListener('input',show);
  search.addEventListener('keydown',event=>{if(event.key==='Escape'&&search.value){event.preventDefault();event.stopPropagation();clear.click();}});
  nav.addEventListener('keydown',event=>{const buttons=[...nav.querySelectorAll('button')],index=buttons.indexOf(document.activeElement);if(index<0)return;let next;if(event.key==='ArrowRight')next=(index+1)%buttons.length;else if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;event.preventDefault();buttons[next].focus();buttons[next].click();});
  show();
  // Scripts loaded asynchronously may add panels after the initial layout.
  const observer=new MutationObserver(()=>{const pending=[...left.children,...right.children].filter(n=>n!==shell);if(!pending.length)return;observer.disconnect();collect(left);collect(right);pinTextPanel();show();observer.observe(left,{childList:true});observer.observe(right,{childList:true})});
  observer.observe(left,{childList:true});observer.observe(right,{childList:true});
})();
