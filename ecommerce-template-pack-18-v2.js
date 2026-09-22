/* APANAM — E-commerce Original Editable Posters v2
   18 category-specific 1080x1080 designs, authored for the existing APANAM layer editor.
   CSS stage is 540x540; export scales it to 1080x1080. No external assets. */
(()=>{
  if(window.__apanamEcommercePack18v2)return; window.__apanamEcommercePack18v2=true;
  const stage=document.querySelector('#stage'); if(!stage)return;
  const wire=window.APANAM_EDITOR_WIRE||window.wire;
  const defs=[
    ['fashion','Fashion & Clothing',['#0f172a','#f97316','#fff7ed'],'NEW SEASON','UP TO 60% OFF'],
    ['electronics','Mobiles & Electronics',['#071a2b','#22d3ee','#e6faff'],'SMART TECH','EXCLUSIVE DEALS'],
    ['home','Home & Kitchen',['#183b33','#84cc16','#f3fbe8'],'HOME REFRESH','SPECIAL PRICES'],
    ['beauty','Beauty & Personal Care',['#4a174f','#f472b6','#fff0f7'],'BEAUTY EDIT','GLOW • SAVE • REPEAT'],
    ['grocery','Grocery & Daily Needs',['#103b2b','#facc15','#fff9db'],'FRESH PICKS','DAILY DEALS'],
    ['furniture','Furniture & Home Decor',['#3b2418','#d6a66d','#fff4e7'],'HOME MAKEOVER','UPGRADE YOUR SPACE'],
    ['sports','Sports & Fitness',['#0b1f36','#34d399','#eafff6'],'MOVE MORE','FITNESS DEALS'],
    ['toys','Toys & Games',['#43133f','#fb7185','#fff0f6'],'PLAY TIME','FUN DEALS'],
    ['books','Books & Stationery',['#102a43','#fbbf24','#fff8df'],'READ • WRITE','STUDY SMART'],
    ['jewellery','Jewellery & Watches',['#241333','#d8b4fe','#f8f1ff'],'TIMELESS','ELEGANT OFFERS'],
    ['auto','Automotive',['#17202a','#ef4444','#fff1f2'],'DRIVE READY','AUTO ESSENTIALS'],
    ['pets','Pet Supplies',['#114444','#2dd4bf','#e9fffb'],'PET CARE','HAPPY PETS • HAPPY HOME'],
    ['health','Health & Wellness',['#24245f','#818cf8','#eef2ff'],'WELLNESS','EVERYDAY SELF CARE'],
    ['baby','Baby & Kids',['#7c2d12','#fb923c','#fff2e6'],'LITTLE JOYS','MADE FOR GROWING SMILES'],
    ['deals','Deals & Offers',['#111827','#facc15','#fffbe8'],'MEGA DEAL','LIMITED TIME'],
    ['business','Business & Services',['#172554','#60a5fa','#edf6ff'],'BUSINESS BOOST','PROMOTE • CONNECT • GROW'],
    ['festival','Festival & Seasonal',['#4c1d95','#f0abfc','#fff0ff'],'FESTIVE EDIT','CELEBRATE & SAVE'],
    ['social','Social Media Posters',['#052e2b','#34d399','#ecfffa'],'BRAND SPOTLIGHT','MAKE YOUR NEXT POST COUNT']
  ];
  const S=540;
  const esc=s=>String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  function clear(){stage.innerHTML=''; stage.style.background='#fff';}
  function addText(text,x,y,w,h,size,color,weight=700,align='left',name=''){
    const e=document.createElement('div'); e.className='element'; e.dataset.kind='text'; e.dataset.text=text; if(name)e.dataset.name=name;
    Object.assign(e.style,{position:'absolute',left:x+'px',top:y+'px',width:w+'px',height:h+'px',fontSize:size+'px',color,fontWeight:weight,display:'flex',alignItems:'center',justifyContent:align==='center'?'center':align==='right'?'flex-end':'flex-start',textAlign:align,padding:'2px 4px',boxSizing:'border-box',lineHeight:'1.08',whiteSpace:'pre-wrap',overflowWrap:'anywhere',zIndex:'5'});
    e.textContent=text; stage.appendChild(e); wire?.(e); return e;
  }
  function rect(x,y,w,h,bg,r=0,z=1,border='none'){
    const e=document.createElement('div'); e.className='element'; e.dataset.kind='shape'; e.dataset.shape='rect';
    Object.assign(e.style,{position:'absolute',left:x+'px',top:y+'px',width:w+'px',height:h+'px',background:bg,borderRadius:r+'px',border,zIndex:String(z),boxSizing:'border-box'});
    stage.appendChild(e); wire?.(e); return e;
  }
  function circle(x,y,d,bg,z=2){return rect(x,y,d,d,bg,d/2,z)}
  function image(x,y,w,h,bg='#f8fafc',label='YOUR PRODUCT PHOTO'){
    const e=document.createElement('div'); e.className='element'; e.dataset.kind='image'; e.dataset.name='Product Photo Area';
    Object.assign(e.style,{position:'absolute',left:x+'px',top:y+'px',width:w+'px',height:h+'px',background:bg,borderRadius:'18px',overflow:'hidden',zIndex:'3',boxSizing:'border-box',border:'1px dashed #cbd5e1'});
    e.innerHTML='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#94a3b8;font:800 12px/1.3 Arial;text-align:center;padding:14px;box-sizing:border-box">'+esc(label)+'</div>';
    stage.appendChild(e); wire?.(e); return e;
  }
  function pill(text,x,y,w,bg,color,size=12){rect(x,y,w,28,bg,14,4);addText(text,x+4,y+1,w-8,26,size,color,900,'center')}
  function commonBrand(d){addText('YOUR BRAND',24,20,150,24,12,d[1],900,'left','Brand Name')}
  function footer(d,price='₹699',mrp='₹999',offer='FREE DELIVERY'){
    addText('PRODUCT NAME',28,405,275,36,20,d[0],900,'left','Product Name');
    addText(price,28,447,150,38,26,d[0],900,'left','Price');
    addText('MRP '+mrp,178,450,120,26,12,'#64748b',500,'left','MRP');
    addText(offer,28,485,220,26,12,d[0],800,'left','Offer');
    rect(378,448,132,48,d[1],24,4); addText('SHOP NOW',388,458,112,28,13,d[0],900,'center','CTA');
  }
  function layout(i,d){
    const [dark,accent,pale]=d[2]; clear();
    const v=i%6;
    if(v===0){ // editorial split
      rect(0,0,S,150,dark); commonBrand(d); addText(d[3],25,58,330,50,31,'#fff',900); addText(d[4],28,111,320,25,13,accent,800); image(28,176,300,205,pale); rect(345,176,167,205,accent,18,2); addText('50%',357,196,143,64,45,dark,900,'center'); addText('OFF',357,258,143,35,24,dark,900,'center'); addText('LIMITED OFFER',357,315,143,24,10,dark,800,'center'); footer(d); }
    if(v===1){ // minimal card
      rect(0,0,S,S,pale); rect(22,22,496,90,'#fff',22,2); commonBrand(d); pill(d[3],330,43,160,accent,dark); addText(d[4],28,130,484,40,22,dark,900,'center'); image(55,185,430,190,'#fff'); footer(d,'₹1,299','₹1,899','LIMITED TIME'); }
    if(v===2){ // dark luxury
      rect(0,0,S,S,dark); commonBrand(d); addText(d[3],28,65,330,58,34,'#fff',900); addText(d[4],30,120,330,28,13,accent,800); image(305,175,190,230,'#fff'); rect(25,185,245,220,accent,24,2); addText('UP TO',45,215,205,28,15,dark,900); addText('50% OFF',42,250,220,62,33,dark,900); addText('SELECTED PICKS',44,330,210,25,11,dark,800); addText('YOUR BRAND',28,380,200,25,12,accent,900,'left','Brand Name'); footer({0:'#fff',1:accent},'₹799','₹1,299','SHOP TODAY'); }
    if(v===3){ // diagonal energy
      rect(0,0,S,S,'#fff'); rect(0,0,540,220,dark); rect(-80,150,700,125,accent,0,2); commonBrand(d); addText(d[3],25,65,350,55,34,'#fff',900); addText(d[4],28,120,390,28,13,'#fff',700); image(70,185,400,190,'#fff'); footer(d,'₹899','₹1,499','SAVE MORE TODAY'); }
    if(v===4){ // product-first
      rect(0,0,S,S,pale); commonBrand(d); addText(d[3],25,56,480,48,30,dark,900,'center'); addText(d[4],30,108,480,25,12,dark,800,'center'); image(30,150,480,225,'#fff'); rect(30,388,480,112,'#fff',20,3); addText('PRODUCT NAME',48,398,270,30,19,dark,900,'left','Product Name'); addText('₹999',48,438,130,38,27,dark,900,'left','Price'); addText('MRP ₹1,499',178,444,120,24,11,'#64748b',500,'left','MRP'); rect(382,430,105,42,accent,21,4); addText('BUY NOW',389,438,91,25,11,dark,900,'center','CTA'); }
    if(v===5){ // social bold
      rect(0,0,S,S,dark); circle(405,22,105,accent,1); circle(440,52,52,pale,2); commonBrand(d); addText(d[3],25,72,350,50,32,'#fff',900); addText(d[4],28,125,390,30,13,accent,800); image(35,178,470,170,'#fff'); addText('PRODUCT NAME',28,360,300,34,21,'#fff',900,'left','Product Name'); addText('₹699',28,402,150,40,28,accent,900,'left','Price'); addText('MRP ₹999',170,410,110,24,11,'#cbd5e1',500,'left','MRP'); pill('SHOP NOW',370,405,130,accent,dark,12); addText('Offer • Price • Photo • Logo — all editable',28,470,470,30,11,'#cbd5e1',600,'left'); }
  }
  const panel=document.querySelector('.organizer-panel[data-group="Templates"]');
  const old=document.getElementById('apanamEcom18'); if(old)old.remove();
  const box=document.createElement('details'); box.id='apanamEcom18'; box.className='organizer-section'; box.open=true;
  const sum=document.createElement('summary'); sum.textContent='🛍️ E-Commerce — 18 Original Editable Templates'; box.appendChild(sum);
  const note=document.createElement('div'); note.textContent='1080×1080 • product photo, name, price, MRP, offer, brand & CTA editable'; Object.assign(note.style,{fontSize:'11px',lineHeight:'1.35',color:'#64748b',padding:'5px 8px'}); box.appendChild(note);
  const grid=document.createElement('div'); Object.assign(grid.style,{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'7px',padding:'8px 0'});
  defs.forEach((d,i)=>{const b=document.createElement('button'); b.type='button'; b.textContent=d[1]; b.title=d[3]+' • '+d[4]; Object.assign(b.style,{minHeight:'54px',padding:'8px 6px',border:'1px solid #ddd6fe',borderRadius:'12px',background:'linear-gradient(135deg,#fff,#faf7ff)',color:'#4c1d95',fontWeight:'850',fontSize:'11px',cursor:'pointer'}); b.onclick=()=>layout(i,d); grid.appendChild(b)});
  box.appendChild(grid); if(panel)panel.prepend(box);
  window.APANAM_ECOMMERCE_TEMPLATES={}; defs.forEach((d,i)=>window.APANAM_ECOMMERCE_TEMPLATES[d[0]]=()=>layout(i,d)); window.APANAM_ECOMMERCE_DEFS=defs;
  // Start with a polished first template only when the pack has no poster yet.
  if(!stage.querySelector('.element')) layout(0,defs[0]);
})();
