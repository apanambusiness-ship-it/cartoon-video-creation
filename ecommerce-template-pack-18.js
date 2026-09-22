/* APANAM — Original E-commerce Poster Pack: 18 editable templates
   Browser-only. No external assets. Works with the existing APANAM editor layer model. */
(()=>{
  if(window.__apanamEcommercePack18)return; window.__apanamEcommercePack18=true;
  const stage=document.querySelector('#stage'); if(!stage)return;
  const $=s=>document.querySelector(s);
  const C={
    fashion:['#111827','#f59e0b','#fff7ed'], electronics:['#0f172a','#38bdf8','#e0f2fe'],
    home:['#173b2f','#84cc16','#ecfccb'], beauty:['#3b0a45','#f472b6','#fce7f3'],
    grocery:['#123b5d','#fbbf24','#fef3c7'], furniture:['#3f2d20','#d4a373','#f5e6d3'],
    sports:['#102a43','#22c55e','#dcfce7'], toys:['#4a1942','#fb7185','#fce7f3'],
    books:['#1e3a5f','#fbbf24','#fef3c7'], jewellery:['#2b1b3f','#c084fc','#f3e8ff'],
    auto:['#17202a','#ef4444','#fee2e2'], pets:['#174e4f','#2dd4bf','#ccfbf1'],
    health:['#312e81','#a5b4fc','#e0e7ff'], baby:['#7c2d12','#fb923c','#ffedd5'],
    deals:['#111827','#facc15','#fef9c3'], business:['#1f2937','#60a5fa','#dbeafe'],
    festival:['#581c87','#f0abfc','#fae8ff'], social:['#0f172a','#34d399','#d1fae5']
  };
  const defs=[
    ['fashion','Fashion & Clothing','STYLE SALE','Up to 60% OFF'],['electronics','Mobiles & Electronics','SMART DEALS','Best Tech. Better Prices.'],
    ['home','Home & Kitchen','MAKE HOME BETTER','Special Home Offers'],['beauty','Beauty & Personal Care','BEAUTY PICKS','Glow More • Save More'],
    ['grocery','Grocery & Daily Needs','DAILY NEEDS SALE','Fresh Deals Every Day'],['furniture','Furniture & Home Decor','HOME MAKEOVER','Upgrade Your Space'],
    ['sports','Sports & Fitness','FITNESS SALE','Move More. Pay Less.'],['toys','Toys & Games','FUN STARTS HERE','Kids’ Favorites on Sale'],
    ['books','Books & Stationery','READ • WRITE • CREATE','Everything for Study & Work'],['jewellery','Jewellery & Watches','TIMELESS DEALS','Elegant Looks. Special Prices.'],
    ['auto','Automotive','AUTO ESSENTIALS','Drive Better for Less'],['pets','Pet Supplies','PET CARE SALE','Happy Pets, Happy Homes'],
    ['health','Health & Wellness','WELLNESS PICKS','Feel Good. Live Better.'],['baby','Baby & Kids','LITTLE ONES SALE','Made for Growing Smiles'],
    ['deals','Deals & Offers','MEGA DEALS','LIMITED-TIME OFFERS'],['business','Business & Services','GROW YOUR BUSINESS','Promote. Connect. Grow.'],
    ['festival','Festival & Seasonal','FESTIVE SPECIAL','Celebrate More • Save More'],['social','Social Media Posters','SOCIAL PROMOTION','Make Your Brand Stand Out']
  ];
  const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function clear(){ if(typeof snap==='function')snap(); stage.innerHTML=''; }
  function el({text='',kind='text',x=0,y=0,w=200,h=50,size=28,color='#111',weight=700,bg='',radius=0,align='left',name=''}){
    const e=document.createElement('div'); e.className='element'; e.dataset.kind=kind; e.dataset.text=text; if(name)e.dataset.name=name;
    Object.assign(e.style,{position:'absolute',left:x+'px',top:y+'px',width:w+'px',minHeight:h+'px',fontSize:size+'px',color, fontWeight:weight,background:bg,borderRadius:radius+'px',textAlign:align,display:'flex',alignItems:'center',justifyContent:align==='center'?'center':align==='right'?'flex-end':'flex-start',padding:'4px 8px',boxSizing:'border-box',whiteSpace:'pre-wrap',overflowWrap:'anywhere',lineHeight:'1.12',zIndex:String(2)});
    e.textContent=text; stage.appendChild(e); if(typeof wire==='function')wire(e); return e;
  }
  function image(ph,x,y,w,h,bg){
    const e=document.createElement('div'); e.className='element'; e.dataset.kind='image'; e.dataset.name='Product Photo Area';
    Object.assign(e.style,{position:'absolute',left:x+'px',top:y+'px',width:w+'px',height:h+'px',background:bg, borderRadius:'22px',overflow:'hidden',zIndex:'1',border:'2px dashed #cbd5e1'});
    e.innerHTML='<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#64748b;font:700 18px Arial;text-align:center;padding:15px">PRODUCT IMAGE<br>Replace with your photo</div>';
    stage.appendChild(e); if(typeof wire==='function')wire(e); return e;
  }
  function block(x,y,w,h,bg,r=0,z=0){const e=document.createElement('div');e.className='element';e.dataset.shape='rect';Object.assign(e.style,{position:'absolute',left:x+'px',top:y+'px',width:w+'px',height:h+'px',background:bg,borderRadius:r+'px',zIndex:String(z)});stage.appendChild(e);if(typeof wire==='function')wire(e);return e}
  function base(key,title,sub,variant=0){
    const [dark,accent,pale]=C[key]; clear(); stage.style.background='#fff';
    block(0,0,1080,1080,'#fff',0,0);
    if(variant===0){block(0,0,1080,300,dark);el({text:title,x:65,y:48,w:760,h:72,size:48,color:'#fff',weight:900});el({text:sub,x:68,y:126,w:700,h:48,size:22,color:'#fff',weight:600});el({text:'YOUR BRAND',x:760,y:55,w:250,h:40,size:22,color:accent,weight:900,align:'right',name:'Brand Name'});}
    if(variant===1){block(0,0,1080,1080,pale);block(0,0,1080,180,dark);el({text:title,x:55,y:38,w:690,h:62,size:43,color:'#fff',weight:900});el({text:'YOUR BRAND',x:770,y:44,w:250,h:40,size:21,color:accent,weight:900,align:'right',name:'Brand Name'});el({text:sub,x:58,y:195,w:960,h:55,size:25,color:dark,weight:800,align:'center'});}
    if(variant===2){block(0,0,1080,1080,dark);el({text:'YOUR BRAND',x:55,y:45,w:300,h:40,size:21,color:accent,weight:900,name:'Brand Name'});el({text:title,x:55,y:120,w:650,h:150,size:58,color:'#fff',weight:900});el({text:sub,x:60,y:275,w:600,h:55,size:24,color:'#fff',weight:600});}
    if(variant===3){block(0,0,1080,220,dark);el({text:'YOUR BRAND',x:55,y:35,w:320,h:38,size:21,color:accent,weight:900,name:'Brand Name'});el({text:title,x:55,y:78,w:780,h:75,size:50,color:'#fff',weight:900});el({text:sub,x:55,y:155,w:800,h:40,size:20,color:'#fff',weight:600});}
    return {dark,accent,pale};
  }
  function finish(d,price='₹699',offer='FREE DELIVERY'){
    el({text:price,x:65,y:880,w:360,h:70,size:48,color:d.dark,weight:900,name:'Price'});
    el({text:offer,x:65,y:955,w:500,h:50,size:22,color:d.dark,weight:800,name:'Offer'});
    block(735,930,280,70,d.accent,35);el({text:'SHOP NOW',x:755,y:940,w:240,h:45,size:22,color:d.dark,weight:900,align:'center',name:'CTA'});
  }
  function make(key,variant){const def=defs.find(x=>x[0]===key),d=base(key,def[2],def[3],variant);
    if(variant===0){image('',70,330,610,500,d.pale);block(720,350,285,280,d.pale,26);el({text:'50%',x:750,y:385,w:225,h:80,size:66,color:d.accent,weight:900,align:'center'});el({text:'OFF',x:750,y:465,w:225,h:45,size:26,color:d.dark,weight:900,align:'center'});el({text:'Limited time offer',x:750,y:535,w:225,h:35,size:17,color:d.dark,weight:700,align:'center'});}
    if(variant===1){image('',75,315,930,470,'#fff');el({text:'SPECIAL OFFER',x:95,y:805,w:330,h:45,size:20,color:d.dark,weight:900});}
    if(variant===2){image('',620,390,380,430,'#fff');block(55,410,480,340,d.accent,28);el({text:'UP TO',x:85,y:445,w:300,h:42,size:24,color:d.dark,weight:900});el({text:'50% OFF',x:80,y:490,w:380,h:90,size:54,color:d.dark,weight:900});el({text:'LIMITED TIME',x:85,y:600,w:320,h:40,size:20,color:d.dark,weight:900});}
    if(variant===3){image('',70,285,940,470,'#fff');el({text:'NEW ARRIVAL',x:65,y:790,w:300,h:45,size:23,color:d.accent,weight:900});}
    finish(d);
    el({text:'Edit product name • price • photo • logo • offer',x:55,y:1015,w:700,h:35,size:14,color:'#64748b',weight:600});
  }
  window.APANAM_ECOMMERCE_TEMPLATES={};
  defs.forEach((d,i)=>{window.APANAM_ECOMMERCE_TEMPLATES[d[0]]=()=>make(d[0],i%4)});
  window.APANAM_ECOMMERCE_DEFS=defs;

  // Category browser in the existing Templates organizer.
  const panel=document.querySelector('.organizer-panel[data-group="Templates"]');
  if(panel&&!document.getElementById('apanamEcom18')){
    const box=document.createElement('details'); box.id='apanamEcom18'; box.className='organizer-section'; box.open=false;
    const sum=document.createElement('summary'); sum.textContent='🛍️ E-Commerce — 18 Original Editable Templates'; box.appendChild(sum);
    const grid=document.createElement('div'); Object.assign(grid.style,{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'7px',padding:'8px 0'});
    defs.forEach(d=>{const b=document.createElement('button');b.type='button';b.textContent=d[1];b.title=d[3];Object.assign(b.style,{padding:'10px 7px',border:'1px solid #ddd6fe',borderRadius:'10px',background:'#fff',color:'#4c1d95',fontWeight:'800',cursor:'pointer'});b.onclick=()=>window.APANAM_ECOMMERCE_TEMPLATES[d[0]]();grid.appendChild(b)});
    box.appendChild(grid); panel.prepend(box);
  }
})();
