/* APANAM — E-commerce Original Editable Posters v4
   18 category-specific editable poster designs.
   No external assets required. Product visuals are native editable SVG/DOM elements.
*/
(()=>{
  window.__apanamEcommercePack18v4=true;

  const stage=document.querySelector('#stage');
  if(!stage)return;

  const wire=window.APANAM_EDITOR_WIRE||window.wire;

  const defs=[
    ['fashion','Fashion & Clothing',['#111827','#f97316','#fff7ed'],'NEW SEASON','UP TO 60% OFF','FASHION'],
    ['electronics','Mobiles & Electronics',['#071a2b','#22d3ee','#e6faff'],'SMART TECH','EXCLUSIVE DEALS','PHONE'],
    ['home','Home & Kitchen',['#183b33','#84cc16','#f3fbe8'],'HOME REFRESH','SPECIAL PRICES','HOME'],
    ['beauty','Beauty & Personal Care',['#4a174f','#f472b6','#fff0f7'],'BEAUTY EDIT','GLOW • SAVE • REPEAT','BEAUTY'],
    ['grocery','Grocery & Daily Needs',['#103b2b','#facc15','#fff9db'],'FRESH PICKS','DAILY DEALS','GROCERY'],
    ['furniture','Furniture & Home Decor',['#3b2418','#d6a66d','#fff4e7'],'HOME MAKEOVER','UPGRADE YOUR SPACE','SOFA'],
    ['sports','Sports & Fitness',['#0b1f36','#34d399','#eafff6'],'MOVE MORE','FITNESS DEALS','SPORT'],
    ['toys','Toys & Games',['#43133f','#fb7185','#fff0f6'],'PLAY TIME','FUN DEALS','TOY'],
    ['books','Books & Stationery',['#102a43','#fbbf24','#fff8df'],'READ • WRITE','STUDY SMART','BOOK'],
    ['jewellery','Jewellery & Watches',['#241333','#d8b4fe','#f8f1ff'],'TIMELESS','ELEGANT OFFERS','WATCH'],
    ['auto','Automotive',['#17202a','#ef4444','#fff1f2'],'DRIVE READY','AUTO ESSENTIALS','CAR'],
    ['pets','Pet Supplies',['#114444','#2dd4bf','#e9fffb'],'PET CARE','HAPPY PETS • HAPPY HOME','PET'],
    ['health','Health & Wellness',['#24245f','#818cf8','#eef2ff'],'WELLNESS','EVERYDAY SELF CARE','HEALTH'],
    ['baby','Baby & Kids',['#7c2d12','#fb923c','#fff2e6'],'LITTLE JOYS','MADE FOR GROWING SMILES','BABY'],
    ['deals','Deals & Offers',['#111827','#facc15','#fffbe8'],'MEGA DEAL','LIMITED TIME','DEAL'],
    ['business','Business & Services',['#172554','#60a5fa','#edf6ff'],'BUSINESS BOOST','PROMOTE • CONNECT • GROW','BIZ'],
    ['festival','Festival & Seasonal',['#4c1d95','#f0abfc','#fff0ff'],'FESTIVE EDIT','CELEBRATE & SAVE','FEST'],
    ['social','Social Media Posters',['#052e2b','#34d399','#ecfffa'],'BRAND SPOTLIGHT','MAKE YOUR NEXT POST COUNT','SOCIAL']
  ];

  const esc=s=>String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
  function clear(){stage.innerHTML=''; stage.style.background='#fff';}

  function addText(text,x,y,w,h,size,color,weight=700,align='left',name=''){
    const e=document.createElement('div');
    e.className='element'; e.dataset.kind='text'; e.dataset.text=text;
    if(name)e.dataset.name=name;
    Object.assign(e.style,{position:'absolute',left:x+'px',top:y+'px',width:w+'px',height:h+'px',fontSize:size+'px',color,fontWeight:weight,display:'flex',alignItems:'center',justifyContent:align==='center'?'center':align==='right'?'flex-end':'flex-start',textAlign:align,padding:'2px 4px',boxSizing:'border-box',lineHeight:'1.08',whiteSpace:'pre-wrap',overflowWrap:'anywhere',zIndex:'5'});
    e.textContent=text; stage.appendChild(e); wire?.(e); return e;
  }

  function rect(x,y,w,h,bg,r=0,z=1,border='none'){
    const e=document.createElement('div');
    e.className='element'; e.dataset.kind='shape'; e.dataset.shape='rect';
    Object.assign(e.style,{position:'absolute',left:x+'px',top:y+'px',width:w+'px',height:h+'px',background:bg,borderRadius:r+'px',border,zIndex:String(z),boxSizing:'border-box'});
    stage.appendChild(e); wire?.(e); return e;
  }

  function circle(x,y,d,bg,z=2){return rect(x,y,d,d,bg,d/2,z);}

  /* Native vector product illustrations — no external image files. */
  function productArt(type,x,y,w,h,accent,pale,dark){
    const g=document.createElement('div');
    g.className='element';
    g.dataset.kind='shape';
    g.dataset.name='Original Product Visual';
    Object.assign(g.style,{position:'absolute',left:x+'px',top:y+'px',width:w+'px',height:h+'px',zIndex:'3',overflow:'hidden',borderRadius:'20px',background:pale,boxSizing:'border-box'});
    g.innerHTML = artSVG(type,w,h,accent,dark);
    stage.appendChild(g); wire?.(g); return g;
  }

  function artSVG(type,w,h,a,d){
    const common=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${d}"/></linearGradient></defs>`;
    let s='';
    if(type==='FASHION') s=`<rect x="0" y="0" width="${w}" height="${h}" fill="#fff"/><circle cx="${w*.5}" cy="${h*.28}" r="${h*.18}" fill="#fde68a"/><path d="M${w*.28} ${h*.9} Q${w*.3} ${h*.5} ${w*.42} ${h*.38} L${w*.5} ${h*.55} L${w*.58} ${h*.38} Q${w*.7} ${h*.5} ${w*.72} ${h*.9}Z" fill="url(#g)"/>`;
    if(type==='PHONE') s=`<rect x="${w*.32}" y="${h*.06}" width="${w*.36}" height="${h*.88}" rx="${w*.05}" fill="${d}"/><rect x="${w*.345}" y="${h*.13}" width="${w*.31}" height="${h*.68}" rx="8" fill="${a}"/><circle cx="${w*.5}" cy="${h*.87}" r="7" fill="#fff"/>`;
    if(type==='HOME') s=`<path d="M${w*.18} ${h*.48} L${w*.5} ${h*.18} L${w*.82} ${h*.48} V${h*.84} H${w*.18}Z" fill="${d}"/><rect x="${w*.42}" y="${h*.55}" width="${w*.16}" height="${h*.29}" fill="${a}"/><rect x="${w*.27}" y="${h*.52}" width="${w*.12}" height="${h*.12}" fill="#fff"/>`;
    if(type==='BEAUTY') s=`<ellipse cx="${w*.5}" cy="${h*.7}" rx="${w*.28}" ry="${h*.1}" fill="#ddd"/><rect x="${w*.35}" y="${h*.32}" width="${w*.3}" height="${h*.38}" rx="18" fill="url(#g)"/><rect x="${w*.41}" y="${h*.18}" width="${w*.18}" height="${h*.18}" rx="6" fill="${d}"/><circle cx="${w*.5}" cy="${h*.48}" r="${w*.055}" fill="#fff"/>`;
    if(type==='GROCERY') s=`<path d="M${w*.25} ${h*.35} H${w*.75} L${w*.68} ${h*.82} H${w*.32}Z" fill="${a}"/><path d="M${w*.38} ${h*.35} Q${w*.5} ${h*.08} ${w*.62} ${h*.35}" fill="none" stroke="${d}" stroke-width="10"/><circle cx="${w*.38}" cy="${h*.88}" r="10" fill="${d}"/><circle cx="${w*.62}" cy="${h*.88}" r="10" fill="${d}"/>`;
    if(type==='SOFA') s=`<rect x="${w*.18}" y="${h*.45}" width="${w*.64}" height="${h*.25}" rx="20" fill="${d}"/><rect x="${w*.24}" y="${h*.3}" width="${w*.52}" height="${h*.24}" rx="20" fill="${a}"/><rect x="${w*.25}" y="${h*.68}" width="12" height="${h*.15}" fill="${d}"/><rect x="${w*.73}" y="${h*.68}" width="12" height="${h*.15}" fill="${d}"/>`;
    if(type==='SPORT') s=`<circle cx="${w*.5}" cy="${h*.5}" r="${w*.28}" fill="#fff" stroke="${a}" stroke-width="10"/><path d="M${w*.5} ${h*.22} L${w*.62} ${h*.42} L${w*.55} ${h*.68} L${w*.32} ${h*.62} L${w*.28} ${h*.4}Z" fill="${a}"/>`;
    if(type==='TOY') s=`<circle cx="${w*.5}" cy="${h*.5}" r="${w*.25}" fill="${a}"/><circle cx="${w*.42}" cy="${h*.46}" r="12" fill="#fff"/><circle cx="${w*.58}" cy="${h*.46}" r="12" fill="#fff"/><circle cx="${w*.42}" cy="${h*.46}" r="5" fill="${d}"/><circle cx="${w*.58}" cy="${h*.46}" r="5" fill="${d}"/><path d="M${w*.4} ${h*.6} Q${w*.5} ${h*.72} ${w*.6} ${h*.6}" fill="none" stroke="${d}" stroke-width="7"/>`;
    if(type==='BOOK') s=`<path d="M${w*.2} ${h*.25} Q${w*.5} ${h*.15} ${w*.5} ${h*.35} V${h*.82} Q${w*.5} ${h*.66} ${w*.2} ${h*.78}Z" fill="${a}"/><path d="M${w*.8} ${h*.25} Q${w*.5} ${h*.15} ${w*.5} ${h*.35} V${h*.82} Q${w*.5} ${h*.66} ${w*.8} ${h*.78}Z" fill="${d}"/>`;
    if(type==='WATCH') s=`<rect x="${w*.43}" y="${h*.05}" width="${w*.14}" height="${h*.25}" rx="12" fill="${d}"/><rect x="${w*.43}" y="${h*.7}" width="${w*.14}" height="${h*.25}" rx="12" fill="${d}"/><circle cx="${w*.5}" cy="${h*.52}" r="${w*.25}" fill="${a}" stroke="${d}" stroke-width="8"/><circle cx="${w*.5}" cy="${h*.52}" r="5" fill="#fff"/>`;
    if(type==='CAR') s=`<path d="M${w*.18} ${h*.65} L${w*.28} ${h*.38} Q${w*.32} ${h*.28} ${w*.45} ${h*.28} H${w*.62} Q${w*.72} ${h*.3} ${w*.77} ${h*.42} L${w*.84} ${h*.65} V${h*.76} H${w*.18}Z" fill="${d}"/><circle cx="${w*.3}" cy="${h*.76}" r="18" fill="#111"/><circle cx="${w*.7}" cy="${h*.76}" r="18" fill="#111"/><rect x="${w*.35}" y="${h*.38}" width="${w*.28}" height="${h*.13}" rx="5" fill="${a}"/>`;
    if(type==='PET') s=`<circle cx="${w*.5}" cy="${h*.52}" r="${w*.22}" fill="${a}"/><circle cx="${w*.36}" cy="${h*.3}" r="${w*.12}" fill="${a}"/><circle cx="${w*.64}" cy="${h*.3}" r="${w*.12}" fill="${a}"/><circle cx="${w*.43}" cy="${h*.5}" r="7" fill="${d}"/><circle cx="${w*.57}" cy="${h*.5}" r="7" fill="${d}"/><path d="M${w*.44} ${h*.63} Q${w*.5} ${h*.7} ${w*.56} ${h*.63}" fill="none" stroke="${d}" stroke-width="6"/>`;
    if(type==='HEALTH') s=`<rect x="${w*.34}" y="${h*.22}" width="${w*.32}" height="${h*.58}" rx="15" fill="${a}"/><rect x="${w*.43}" y="${h*.12}" width="${w*.14}" height="${h*.15}" rx="5" fill="${d}"/><rect x="${w*.46}" y="${h*.4}" width="${w*.08}" height="${h*.25}" fill="#fff"/><rect x="${w*.37}" y="${h*.49}" width="${w*.26}" height="${h*.08}" fill="#fff"/>`;
    if(type==='BABY') s=`<circle cx="${w*.5}" cy="${h*.48}" r="${w*.22}" fill="${a}"/><circle cx="${w*.43}" cy="${h*.45}" r="7" fill="${d}"/><circle cx="${w*.57}" cy="${h*.45}" r="7" fill="${d}"/><path d="M${w*.4} ${h*.25} Q${w*.32} ${h*.08} ${w*.42} ${h*.18}" fill="none" stroke="${d}" stroke-width="10"/><path d="M${w*.6} ${h*.25} Q${w*.68} ${h*.08} ${w*.58} ${h*.18}" fill="none" stroke="${d}" stroke-width="10"/>`;
    if(type==='DEAL') s=`<circle cx="${w*.5}" cy="${h*.5}" r="${w*.3}" fill="${a}"/><text x="50%" y="57%" text-anchor="middle" font-family="Arial" font-size="${Math.min(w,h)*.18}" font-weight="900" fill="${d}">%</text>`;
    if(type==='BIZ') s=`<rect x="${w*.2}" y="${h*.3}" width="${w*.6}" height="${h*.48}" rx="12" fill="${d}"/><rect x="${w*.4}" y="${h*.22}" width="${w*.2}" height="${h*.12}" rx="5" fill="${a}"/><rect x="${w*.3}" y="${h*.42}" width="${w*.4}" height="10" fill="${a}"/><rect x="${w*.3}" y="${h*.58}" width="${w*.25}" height="10" fill="${a}"/>`;
    if(type==='FEST') s=`<circle cx="${w*.5}" cy="${h*.5}" r="${w*.25}" fill="${a}"/><path d="M${w*.5} ${h*.16} L${w*.54} ${h*.42} L${w*.78} ${h*.5} L${w*.54} ${h*.58} L${w*.5} ${h*.84} L${w*.46} ${h*.58} L${w*.22} ${h*.5} L${w*.46} ${h*.42}Z" fill="${d}"/>`;
    if(type==='SOCIAL') s=`<rect x="${w*.2}" y="${h*.2}" width="${w*.6}" height="${h*.6}" rx="35" fill="${a}"/><circle cx="${w*.5}" cy="${h*.5}" r="${w*.13}" fill="#fff"/><circle cx="${w*.67}" cy="${h*.33}" r="8" fill="#fff"/>`;
    return common+s+'</svg>';
  }

  function pill(text,x,y,w,bg,color,size=12){
    rect(x,y,w,28,bg,14,4);
    addText(text,x+4,y+1,w-8,26,size,color,900,'center');
  }

  function brand(d){
    addText('YOUR BRAND',24,20,160,24,12,d[1],900,'left','Brand Name');
  }

  function footer(d,price='₹699',mrp='₹999',offer='FREE DELIVERY'){
    addText('PRODUCT NAME',28,400,285,36,20,d[0],900,'left','Product Name');
    addText(price,28,440,150,38,27,d[0],900,'left','Price');
    addText('MRP '+mrp,180,447,125,24,12,'#64748b',500,'left','MRP');
    addText(offer,28,480,250,26,12,d[0],800,'left','Offer');
    rect(380,438,130,48,d[1],24,4);
    addText('SHOP NOW',388,448,114,28,13,d[0],900,'center','CTA');
  }

  function layout(i,d){
    const [dark,accent,pale]=d[2];
    clear();

    const v=i%6;

    if(v===0){
      rect(0,0,540,150,dark);
      brand(d);
      addText(d[3],25,55,350,50,31,'#fff',900);
      addText(d[4],28,108,360,25,13,accent,800);
      productArt(d[5],28,175,305,205,accent,pale,dark);
      rect(350,175,162,205,accent,22,2);
      addText('50%',360,205,142,55,42,dark,900,'center');
      addText('OFF',360,260,142,34,23,dark,900,'center');
      addText('LIMITED OFFER',360,320,142,24,10,dark,800,'center');
      footer(d);
    }

    if(v===1){
      rect(0,0,540,540,pale);
      rect(22,22,496,90,'#fff',22,2);
      brand(d);
      pill(d[3],330,43,160,accent,dark);
      addText(d[4],28,130,484,40,22,dark,900,'center');
      productArt(d[5],55,180,430,195,accent,pale,dark);
      footer(d,'₹1,299','₹1,899','LIMITED TIME');
    }

    if(v===2){
      rect(0,0,540,540,dark);
      brand(d);
      addText(d[3],28,65,330,58,34,'#fff',900);
      addText(d[4],30,120,330,28,13,accent,800);
      productArt(d[5],300,170,205,225,accent,pale,dark);
      rect(25,185,250,215,accent,24,2);
      addText('UP TO',42,215,215,28,15,dark,900);
      addText('50% OFF',40,250,220,62,33,dark,900);
      addText('SELECTED PICKS',42,330,220,25,11,dark,800);
      addText('YOUR BRAND',28,380,200,25,12,accent,900,'left','Brand Name');
      addText('PRODUCT NAME',28,410,240,30,18,'#fff',900,'left','Product Name');
      addText('₹799',28,447,130,32,25,accent,900,'left','Price');
    }

    if(v===3){
      rect(0,0,540,540,'#fff');
      rect(0,0,540,220,dark);
      rect(-80,150,700,125,accent,0,2);
      brand(d);
      addText(d[3],25,65,350,55,34,'#fff',900);
      addText(d[4],28,120,390,28,13,'#fff',700);
      productArt(d[5],70,185,400,190,accent,'#fff',dark);
      footer(d,'₹899','₹1,499','SAVE MORE TODAY');
    }

    if(v===4){
      rect(0,0,540,540,pale);
      brand(d);
      addText(d[3],25,55,490,48,30,dark,900,'center');
      addText(d[4],30,108,480,25,12,dark,800,'center');
      productArt(d[5],30,148,480,225,accent,'#fff',dark);
      rect(30,388,480,112,'#fff',20,3);
      addText('PRODUCT NAME',48,400,270,30,19,dark,900,'left','Product Name');
      addText('₹999',48,438,130,38,27,dark,900,'left','Price');
      addText('MRP ₹1,499',178,444,120,24,11,'#64748b',500,'left','MRP');
      rect(382,430,105,42,accent,21,4);
      addText('BUY NOW',389,438,91,25,11,dark,900,'center','CTA');
    }

    if(v===5){
      rect(0,0,540,540,dark);
      circle(405,22,105,accent,1);
      circle(440,52,52,pale,2);
      brand(d);
      addText(d[3],25,72,350,50,32,'#fff',900);
      addText(d[4],28,125,390,30,13,accent,800);
      productArt(d[5],35,178,470,170,accent,'#fff',dark);
      addText('PRODUCT NAME',28,360,300,34,21,'#fff',900,'left','Product Name');
      addText('₹699',28,402,150,40,28,accent,900,'left','Price');
      addText('MRP ₹999',170,410,110,24,11,'#cbd5e1',500,'left','MRP');
      pill('SHOP NOW',370,405,130,accent,dark,12);
      addText('Offer • Price • Photo • Logo — all editable',28,470,470,30,11,'#cbd5e1',600,'left');
    }
  }

  const panel=document.querySelector('.organizer-panel[data-group="Templates"]');
  const old=document.getElementById('apanamEcom18');
  if(old)old.remove();

  const box=document.createElement('details');
  box.id='apanamEcom18';
  box.className='organizer-section';
  box.open=true;

  const sum=document.createElement('summary');
  sum.textContent='🛍️ E-Commerce — 18 Original Editable Templates';
  box.appendChild(sum);

  const note=document.createElement('div');
  note.textContent='18 original category layouts • editable product visual, name, price, MRP, offer, brand & CTA';
  Object.assign(note.style,{fontSize:'11px',lineHeight:'1.35',color:'#64748b',padding:'5px 8px'});
  box.appendChild(note);

  const grid=document.createElement('div');
  Object.assign(grid.style,{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'7px',padding:'8px 0'});

  defs.forEach((d,i)=>{
    const b=document.createElement('button');
    b.type='button';
    b.textContent=d[1];
    b.title=d[3]+' • '+d[4];

    Object.assign(b.style,{
      minHeight:'54px',
      padding:'8px 6px',
      border:'1px solid #ddd6fe',
      borderRadius:'12px',
      background:'linear-gradient(135deg,#fff,#faf7ff)',
      color:'#4c1d95',
      fontWeight:'850',
      fontSize:'11px',
      cursor:'pointer'
    });

    b.onclick=()=>{
      clear();
      layout(i,d);
    };

    grid.appendChild(b);
  });

  box.appendChild(grid);
  if(panel)panel.prepend(box);

  window.APANAM_ECOMMERCE_TEMPLATES={};

  defs.forEach((d,i)=>{
    window.APANAM_ECOMMERCE_TEMPLATES[d[0]]=()=>{
      clear();
      layout(i,d);
    };
  });

  window.APANAM_ECOMMERCE_DEFS=defs;

  clear();
  layout(0,defs[0]);

})();
