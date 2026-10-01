(()=>{
  const ready=()=>{
    const header=document.querySelector('body>header');
    if(!header){setTimeout(ready,150);return}
    if(document.querySelector('#apanamCompactTools'))return;
    const actions=header.querySelector('.actions');
    const top=actions.querySelector('.header-top-actions'),bottom=actions.querySelector('.header-bottom-actions');
    const utility=actions.querySelector('.header-utility-actions');
    const create=document.getElementById('apanamCreatorHubButton')||document.createElement('button');create.textContent='Create';if(!create.id)create.onclick=()=>{};
    [top,bottom,utility].forEach(row=>{[...row.children].forEach(child=>actions.append(child));row.remove()});
    const order=[create,'studioTemplateLibrary','saveProject','headerEditProject','loadProject','headerDeleteProject','undo','redo','download','apanamInstallApp','apanamHelpButton','apanamSafetyButton'];
    order.forEach(item=>{const node=typeof item==='string'?document.getElementById(item):item;if(node)actions.append(node)});
    const extras=document.createElement('details');extras.id='apanamHeaderExtras';extras.innerHTML='<summary>Install / Publish tools</summary>';
    (document.querySelector('.organizer-panel[data-group="Export"]')||document.querySelector('main>aside:not(.right)'))?.append(extras);
    const allowed=new Set(order.map(item=>typeof item==='string'?item:item.id));
    const moveExtras=()=>[...actions.children].filter(node=>!allowed.has(node.id)).forEach(node=>extras.append(node));
    moveExtras();new MutationObserver(moveExtras).observe(actions,{childList:true});
    const icon=(button,symbol,label)=>{const mark=document.createElement('span');mark.className='apanam-button-icon';mark.setAttribute('aria-hidden','true');mark.textContent=symbol;button.replaceChildren(mark,document.createTextNode(label));button.setAttribute('aria-label',label);return button};
    const headerIcons={apanamCreatorHubButton:['✦','Create'],saveProject:['▣','Save'],headerEditProject:['✎','Edit'],loadProject:['▤','Load'],headerDeleteProject:['▢','Delete'],undo:['↶','Undo'],redo:['↷','Redo'],download:['↓','Download'],apanamInstallApp:['⬇','Install App'],apanamHelpButton:['?','Help'],apanamSafetyButton:['◇','Safety']};
    Object.entries(headerIcons).forEach(([id,[symbol,label]])=>{const control=document.getElementById(id);if(control)icon(control,symbol,label)});
    const placeAccess=()=>{const template=document.getElementById('studioTemplateLibrary'),help=document.getElementById('apanamHelpButton');if(template)actions.prepend(template);if(help)actions.append(help);document.getElementById('studioQuickAccess')?.remove()};window.APANAM_PLACE_ACCESS=placeAccess;placeAccess();
    actions.tabIndex=0;actions.setAttribute('aria-label','Main editor actions, scroll horizontally');
    for(const [id,label,step,sign] of [['studioHeaderPrev','पिछले बटन',-260,'‹'],['studioHeaderNext','अगले बटन',260,'›']]){const arrow=document.createElement('button');arrow.type='button';arrow.id=id;arrow.className='studio-header-arrow';arrow.setAttribute('aria-label',label);arrow.textContent=sign;arrow.onclick=()=>actions.scrollBy({left:step,behavior:'smooth'});if(step<0)actions.before(arrow);else actions.after(arrow)}
    actions.addEventListener('keydown',e=>{if(e.target!==actions||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();e.stopPropagation();actions.scrollBy({left:e.key==='ArrowLeft'?-260:260,behavior:'smooth'})});
    const download=document.getElementById('download');
    download.append(document.createTextNode(' ▾'));
    const menu=document.createElement('div');menu.id='apanamDownloadMenu';menu.hidden=true;
    ['PNG','JPG','PDF'].forEach(fmt=>{const button=document.createElement('button');button.type='button';icon(button,{PNG:'▧',JPG:'▨',PDF:'▤'}[fmt],fmt);button.onclick=async()=>{
      menu.hidden=true;
      if(fmt==='PNG')window.APANAM_EXPORT?.();
      if(fmt==='JPG')document.getElementById('downloadJpg')?.click();
      if(fmt==='PDF')try{await pdfExport()}catch(e){alert('PDF export में समस्या आई: '+e.message)}
    };menu.append(button)});
    document.body.append(menu);
    download.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();const r=download.getBoundingClientRect();menu.style.top=r.bottom+4+'px';menu.style.left=Math.min(r.left,innerWidth-90)+'px';menu.hidden=!menu.hidden},true);
    document.addEventListener('click',e=>{if(e.target!==download&&!menu.contains(e.target))menu.hidden=true});
    const shell=document.createElement('div');shell.id='apanamCompactTools';
    const elementRow=document.createElement('div');elementRow.className='apanam-strip';
    const formatRow=document.createElement('div');formatRow.className='apanam-strip';
    shell.append(elementRow,formatRow);header.after(shell);
    const stripIcons={Text:'T',Image:'▧',Logo:'◇',Phone:'☎',Social:'@',Rectangle:'▭',Circle:'○',Phonetic:'अ',Bold:'B',Italic:'I'};
    const button=(row,label,fn)=>{const b=document.createElement('button');b.type='button';if(stripIcons[label])icon(b,stripIcons[label],label);else b.textContent=label;b.onclick=fn;row.append(b);return b};
    [['Text','text'],['Image','image'],['Logo','logo'],['Phone','phone'],['Social','social'],['Rectangle','rect'],['Circle','circle']].forEach(([label,kind])=>button(elementRow,label,()=>{if(kind==='image')document.getElementById('imageUpload')?.click();else document.querySelector('[data-add="'+kind+'"]')?.click()}));
    button(elementRow,'→',()=>elementRow.scrollBy({left:220,behavior:'smooth'})).className='apanam-next';
    const select=(id)=>document.getElementById(id);
    button(formatRow,'Phonetic',()=>{const lang=select('apanamTypingLanguage');if(lang?.value==='off'){lang.value='hi';lang.dispatchEvent(new Event('change',{bubbles:true}))}select('apanamRomanInput')?.focus()}); const phonetic=select('apanamRomanInput');if(phonetic){phonetic.style.display='block';phonetic.placeholder='Phonetic · भाषा चुनें';formatRow.append(phonetic)}
    const language=select('apanamTypingLanguage'),font=select('fontFamily'),size=document.createElement('input');size.type='number';size.min='10';size.max='160';size.value=select('fontSize')?.value||42;const applySize=()=>{const source=select('fontSize');if(source){source.value=size.value;source.dispatchEvent(new Event('input',{bubbles:true}));source.dispatchEvent(new Event('change',{bubbles:true}))}};size.addEventListener('input',applySize);size.addEventListener('change',applySize);
    [[language,'Language'],[font,'Font'],[size,'Size']].forEach(([control,label])=>{if(control){control.setAttribute('aria-label',label);control.title=label;formatRow.append(control)}});
    [['Bold','bold'],['Italic','italic']].forEach(([label,id])=>button(formatRow,label,()=>select(id)?.click()));
    const align=document.createElement('select');align.setAttribute('aria-label','Align');align.title='Align';[['','Align'],['left','Left'],['center','Center'],['right','Right']].forEach(([value,label])=>align.add(new Option(label,value)));align.onchange=()=>document.querySelector('[data-textalign="'+align.value+'"]')?.click();formatRow.append(align);
    const spacing=select('letterSpacing');if(spacing){const label=document.createElement('label');label.className='apanam-inline-control';label.textContent='Spacing';label.append(spacing);formatRow.append(label)}
    const color=select('color');if(color){const label=document.createElement('label');label.className='apanam-inline-control';label.textContent='Color';label.append(color);formatRow.append(label)}
    button(formatRow,'→',()=>formatRow.scrollBy({left:220,behavior:'smooth'})).className='apanam-next';
    // Keep the established panel available for advanced editing and phonetic input.
  };
  async function pdfExport(){
    const render=window.APANAM_RENDER_CANVAS;if(!render)throw Error('Renderer unavailable');
    const canvas=await render(),raw=atob(canvas.toDataURL('image/jpeg',.92).split(',')[1]);
    const width=canvas.width,height=canvas.height,enc=new TextEncoder();
    const parts=[],offsets=[0];let length=0;
    function append(data){const bytes=typeof data==='string'?enc.encode(data):data;parts.push(bytes);length+=bytes.length}
    append('%PDF-1.4\n');
    function object(n,body){offsets[n]=length;append(n+' 0 obj\n'+body+'\nendobj\n')}
    object(1,'<< /Type /Catalog /Pages 2 0 R >>');
    object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    object(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+width+' '+height+'] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
    offsets[4]=length;append('4 0 obj\n<< /Type /XObject /Subtype /Image /Width '+width+' /Height '+height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+raw.length+' >>\nstream\n');
    const img=Uint8Array.from(raw,c=>c.charCodeAt(0));append(img);append('\nendstream\nendobj\n');
    const commands='q '+width+' 0 0 '+height+' 0 0 cm /Im0 Do Q\n';
    object(5,'<< /Length '+enc.encode(commands).length+' >>\nstream\n'+commands+'endstream');
    const xref=length;append('xref\n0 6\n0000000000 65535 f \n');
    for(let i=1;i<=5;i++)append(String(offsets[i]).padStart(10,'0')+' 00000 n \n');
    append('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF');
    const link=document.createElement('a');link.href=URL.createObjectURL(new Blob(parts,{type:'application/pdf'}));link.download='APANAM-design-'+width+'x'+height+'.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),60000)
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();