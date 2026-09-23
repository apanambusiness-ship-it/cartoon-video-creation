const stage=document.querySelector('#stage'),
      layers=document.querySelector('#layers');

let selected=null,z=1,history=[],redo=[];

const $=s=>document.querySelector(s);

function snap(){
  history.push(stage.innerHTML);
  if(history.length>40) history.shift();
  redo=[];
}

function cleanHandles(el){
  el.querySelectorAll('.handle,.rotateHandle,.resize').forEach(x=>x.remove());
}

function addHandles(el){
  cleanHandles(el);

  ['nw','n','ne','e','se','s','sw','w'].forEach(d=>{
    let h=document.createElement('i');
    h.className='handle '+d;
    h.dataset.dir=d;
    el.appendChild(h);
  });

  let r=document.createElement('i');
  r.className='rotateHandle';
  el.appendChild(r);
}

function select(el){

  document.querySelectorAll('.element')
    .forEach(x=>x.classList.remove('selected'));

  selected=el;

  if(el){

    el.classList.add('selected');

    if($('#textValue'))
      $('#textValue').value=el.dataset.text||'';

    if($('#fontSize'))
      $('#fontSize').value=parseInt(el.style.fontSize)||42;

    if($('#opacity'))
      $('#opacity').value=
        Math.round((parseFloat(el.style.opacity)||1)*100);

    if($('#rotate'))
      $('#rotate').value=
        parseFloat(el.dataset.rotate)||0;

    let c=el.dataset.shape
      ?el.style.backgroundColor
      :el.style.color;

    if($('#color'))
      $('#color').value=rgbHex(c)||'#111111';
  }

  renderLayers();
}

function rgbHex(c){

  if(!c || c[0]==='#') return c;

  let m=c.match(/\d+/g);

  return m
    ?'#'+m.slice(0,3)
      .map(x=>(+x).toString(16).padStart(2,'0'))
      .join('')
    :'';
}

function add(type,src){

  snap();

  let el=document.createElement('div');

  el.className='element';

  el.style.left='80px';
  el.style.top='80px';
  el.style.zIndex=++z;

  el.dataset.rotate='0';

  if(type==='image'){

    el.style.width='220px';
    el.style.height='180px';

    el.dataset.kind='image';

    el.innerHTML=
      `<img src="${src}" style="object-fit:contain">`;

  }else if(type==='rect'||type==='circle'){

    el.dataset.shape=type;

    el.style.width='180px';

    el.style.height=
      type==='circle'
        ?'180px'
        :'110px';

    el.style.background='#6d28d9';

    if(type==='circle')
      el.style.borderRadius='50%';

  }else{

    let map={
      text:'आपका टेक्स्ट',
      logo:'APANAM',
      phone:'+91 98765 43210',
      social:'@apanam'
    };

    el.classList.add('text');

    el.dataset.text=map[type];

    el.textContent=map[type];

    el.style.fontSize=
      type==='logo'
        ?'54px'
        :'42px';

    el.style.fontWeight=
      type==='logo'
        ?'800'
        :'600';

    if(type==='logo')
      el.classList.add('brand');
  }

  addHandles(el);

  stage.appendChild(el);

  wire(el);

  select(el);
}

function wire(el){

  if(!el.querySelector('.handle'))
    addHandles(el);

  el.style.pointerEvents='auto';
  el.style.touchAction='none';
  el.style.userSelect='none';

  el.onclick=e=>{

    if(
      e.target.classList.contains('handle')||
      e.target.classList.contains('rotateHandle')
    ) return;

    e.stopPropagation();

    select(el);
  };

  el.onpointerdown=e=>{

    if(
      e.target.classList.contains('handle')||
      e.target.classList.contains('rotateHandle')||
      el.dataset.locked==='1'
    ) return;

    e.stopPropagation();
    e.preventDefault();

    select(el);

    let sx=e.clientX,
        sy=e.clientY,
        l=el.offsetLeft,
        t=el.offsetTop,
        id=e.pointerId;

    snap();

    try{
      el.setPointerCapture(id);
    }catch(_){}

    function mv(ev){

      if(ev.pointerId!==id) return;

      el.style.left=
        l+(ev.clientX-sx)+'px';

      el.style.top=
        t+(ev.clientY-sy)+'px';
    }

    function up(ev){

      if(ev.pointerId!==id) return;

      el.removeEventListener('pointermove',mv);
      el.removeEventListener('pointerup',up);
      el.removeEventListener('pointercancel',up);

      try{
        el.releasePointerCapture(id);
      }catch(_){}
    }

    el.addEventListener('pointermove',mv);
    el.addEventListener('pointerup',up);
    el.addEventListener('pointercancel',up);
  };

  el.querySelectorAll('.handle').forEach(h=>{

    h.onmousedown=e=>{

      e.stopPropagation();

      if(el.dataset.locked==='1') return;

      select(el);

      snap();

      let d=h.dataset.dir,
          sx=e.clientX,
          sy=e.clientY,
          L=el.offsetLeft,
          T=el.offsetTop,
          W=el.offsetWidth,
          H=el.offsetHeight;

      function mv(ev){

        let dx=ev.clientX-sx,
            dy=ev.clientY-sy,
            nL=L,
            nT=T,
            nW=W,
            nH=H;

        if(d.includes('e'))
          nW=Math.max(30,W+dx);

        if(d.includes('s'))
          nH=Math.max(25,H+dy);

        if(d.includes('w')){

          nW=Math.max(30,W-dx);

          nL=L+(W-nW);
        }

        if(d.includes('n')){

          nH=Math.max(25,H-dy);

          nT=T+(H-nH);
        }

        el.style.left=nL+'px';
        el.style.top=nT+'px';
        el.style.width=nW+'px';
        el.style.height=nH+'px';
      }

      function up(){

        removeEventListener('mousemove',mv);
        removeEventListener('mouseup',up);
      }

      addEventListener('mousemove',mv);
      addEventListener('mouseup',up);
    };
  });

  el.querySelector('.rotateHandle').onmousedown=e=>{

    e.stopPropagation();

    if(el.dataset.locked==='1') return;

    select(el);

    snap();

    function mv(ev){

      let r=el.getBoundingClientRect();

      let cx=r.left+r.width/2,
          cy=r.top+r.height/2;

      let a=
        Math.atan2(
          ev.clientY-cy,
          ev.clientX-cx
        )*180/Math.PI+90;

      el.dataset.rotate=Math.round(a);

      el.style.transform=`rotate(${a}deg)`;

      if($('#rotate'))
        $('#rotate').value=
          Math.max(
            -180,
            Math.min(
              180,
              Math.round(a)
            )
          );
    }

    function up(){

      removeEventListener('mousemove',mv);
      removeEventListener('mouseup',up);
    }

    addEventListener('mousemove',mv);
    addEventListener('mouseup',up);
  };

  el.ondblclick=e=>{

    e.stopPropagation();

    if(
      el.dataset.text!=null &&
      el.dataset.locked!=='1'
    ){

      let v=prompt(
        'Text edit करें',
        el.dataset.text
      );

      if(v!=null){

        snap();

        el.dataset.text=v;

        let textNode=[...el.childNodes]
          .find(n=>n.nodeType===Node.TEXT_NODE);

        if(textNode)
          textNode.nodeValue=v;

        select(el);
      }
    }
  };
}

function renderLayers(){

  layers.innerHTML='';

  [...stage.querySelectorAll('.element')]
    .reverse()
    .forEach(el=>{

      let row=document.createElement('div');

      row.className='layerRow';

      let b=document.createElement('button');

      b.textContent=
        el.dataset.text||
        (
          el.dataset.shape==='circle'
            ?'Circle'
            :el.dataset.shape==='rect'
              ?'Rectangle'
              :'Image'
        );

      b.onclick=()=>select(el);

      let lock=document.createElement('button');

      lock.textContent=
        el.dataset.locked==='1'
          ?'🔒'
          :'🔓';

      lock.onclick=()=>{

        el.dataset.locked=
          el.dataset.locked==='1'
            ?'0'
            :'1';

        el.classList.toggle(
          'locked',
          el.dataset.locked==='1'
        );

        renderLayers();
      };

      let eye=document.createElement('button');

      eye.textContent=
        el.dataset.hidden==='1'
          ?'🙈'
          :'👁';

      eye.onclick=()=>{

        el.dataset.hidden=
          el.dataset.hidden==='1'
            ?'0'
            :'1';

        el.style.visibility=
          el.dataset.hidden==='1'
            ?'hidden'
            :'visible';

        renderLayers();
      };

      row.append(b,lock,eye);

      layers.appendChild(row);
    });
}

document.querySelectorAll('[data-add]')
  .forEach(b=>{
    b.onclick=()=>add(b.dataset.add);
  });

function readImage(file,cb){

  if(!file) return;

  let r=new FileReader();

  r.onload=()=>cb(r.result);

  r.readAsDataURL(file);
}

if($('#imageUpload')){

  $('#imageUpload').onchange=e=>
    readImage(
      e.target.files[0],
      src=>add('image',src)
    );
}

if($('#replaceImage')){

  $('#replaceImage').onchange=e=>
    readImage(
      e.target.files[0],
      src=>{

        if(
          selected &&
          selected.querySelector('img')
        ){

          snap();

          selected.querySelector('img').src=src;
        }
      }
    );
}

if($('#fitImage')){

  $('#fitImage').onclick=()=>{

    if(
      selected &&
      selected.querySelector('img')
    ){

      selected.querySelector('img')
        .style.objectFit='contain';
    }
  };
}

if($('#fillImage')){

  $('#fillImage').onclick=()=>{

    if(
      selected &&
      selected.querySelector('img')
    ){

      selected.querySelector('img')
        .style.objectFit='cover';
    }
  };
}

if($('#bgColor')){

  $('#bgColor').oninput=e=>
    stage.style.backgroundColor=e.target.value;
}

if($('#textValue')){

  $('#textValue').oninput=e=>{

    if(
      selected &&
      selected.dataset.text!=null &&
      selected.dataset.locked!=='1'
    ){

      selected.dataset.text=e.target.value;

      let textNode=[...selected.childNodes]
        .find(n=>n.nodeType===Node.TEXT_NODE);

      if(textNode)
        textNode.nodeValue=e.target.value;

      renderLayers();
    }
  };
}

if($('#fontSize')){

  $('#fontSize').oninput=e=>{

    if(
      selected &&
      selected.dataset.locked!=='1'
    ){

      selected.style.fontSize=
        e.target.value+'px';
    }
  };
}

if($('#color')){

  $('#color').oninput=e=>{

    if(
      selected &&
      selected.dataset.locked!=='1'
    ){

      snap();

      if(selected.dataset.shape)
        selected.style.backgroundColor=e.target.value;
      else
        selected.style.setProperty(
          'color',
          e.target.value,
          'important'
        );
    }
  };
}

if($('#opacity')){

  $('#opacity').oninput=e=>{

    if(
      selected &&
      selected.dataset.locked!=='1'
    ){

      selected.style.opacity=
        e.target.value/100;
    }
  };
}

if($('#rotate')){

  $('#rotate').oninput=e=>{

    if(
      selected &&
      selected.dataset.locked!=='1'
    ){

      selected.dataset.rotate=e.target.value;

      selected.style.transform=
        `rotate(${e.target.value}deg)`;
    }
  };
}

if($('#bold')){

  $('#bold').onclick=()=>{

    if(
      selected &&
      selected.dataset.locked!=='1'
    ){

      selected.style.fontWeight=
        selected.style.fontWeight==='800'
          ?'400'
          :'800';
    }
  };
}

if($('#italic')){

  $('#italic').onclick=()=>{

    if(
      selected &&
      selected.dataset.locked!=='1'
    ){

      selected.style.fontStyle=
        selected.style.fontStyle==='italic'
          ?'normal'
          :'italic';
    }
  };
}

document.querySelectorAll('[data-align]')
  .forEach(b=>{

    b.onclick=()=>{

      if(
        !selected||
        selected.dataset.locked==='1'
      ) return;

      snap();

      let d=b.dataset.align;

      if(d==='left')
        selected.style.left='0px';

      if(d==='center')
        selected.style.left=
          (stage.clientWidth-selected.offsetWidth)/2+'px';

      if(d==='right')
        selected.style.left=
          stage.clientWidth-selected.offsetWidth+'px';

      if(d==='top')
        selected.style.top='0px';

      if(d==='middle')
        selected.style.top=
          (stage.clientHeight-selected.offsetHeight)/2+'px';

      if(d==='bottom')
        selected.style.top=
          stage.clientHeight-selected.offsetHeight+'px';
    };
  });

if($('#delete')){

  $('#delete').onclick=()=>{

    if(
      selected &&
      selected.dataset.locked!=='1'
    ){

      snap();

      selected.remove();

      select(null);
    }
  };
}

if($('#duplicate')){

  $('#duplicate').onclick=()=>{

    if(selected){

      snap();

      let n=selected.cloneNode(true);

      cleanHandles(n);

      addHandles(n);

      n.style.left=
        selected.offsetLeft+20+'px';

      n.style.top=
        selected.offsetTop+20+'px';

      n.style.zIndex=++z;

      stage.appendChild(n);

      wire(n);

      select(n);
    }
  };
}

if($('#front')){

  $('#front').onclick=()=>{

    if(selected)
      selected.style.zIndex=++z;
  };
}

if($('#back')){

  $('#back').onclick=()=>{

    if(selected)
      selected.style.zIndex=1;
  };
}

function size(w,h){

  if($('#cw')) $('#cw').value=w;
  if($('#ch')) $('#ch').value=h;

  stage.style.width=w/2+'px';
  stage.style.height=h/2+'px';
}

if($('#size')){

  $('#size').onchange=e=>
    size(
      ...e.target.value
        .split(',')
        .map(Number)
    );
}

if($('#applySize')){

  $('#applySize').onclick=()=>
    size(
      +$('#cw').value,
      +$('#ch').value
    );
}

window.APANAM_EDITOR_WIRE=wire;

function restore(html){

  stage.innerHTML=html;

  [...stage.querySelectorAll('.element')]
    .forEach(wire);

  select(null);
}

if($('#undo')){

  $('#undo').onclick=()=>{

    if(history.length){

      redo.push(stage.innerHTML);

      restore(history.pop());
    }
  };
}

if($('#redo')){

  $('#redo').onclick=()=>{

    if(redo.length){

      history.push(stage.innerHTML);

      restore(redo.pop());
    }
  };
}

async function exportPNG(){

  select(null);

  let W=+$('#cw').value||1080,
      H=+$('#ch').value||1080,
      sw=stage.clientWidth,
      sh=stage.clientHeight,
      sx=W/sw,
      sy=H/sh,
      c=document.createElement('canvas');

  c.width=W;
  c.height=H;

  let ctx=c.getContext('2d');

  ctx.fillStyle=
    getComputedStyle(stage).backgroundColor||
    '#fff';

  ctx.fillRect(0,0,W,H);

  let els=[
    ...stage.querySelectorAll('.element')
  ]
  .filter(e=>e.dataset.hidden!=='1')
  .sort(
    (a,b)=>
      (+a.style.zIndex||0)-
      (+b.style.zIndex||0)
  );

  for(let el of els){

    ctx.save();

    ctx.globalAlpha=
      parseFloat(el.style.opacity)||1;

    let x=el.offsetLeft*sx,
        y=el.offsetTop*sy,
        w=el.offsetWidth*sx,
        h=el.offsetHeight*sy,
        r=(+el.dataset.rotate||0)
          *Math.PI/180;

    ctx.translate(
      x+w/2,
      y+h/2
    );

    ctx.rotate(r);

    if(el.dataset.shape){

      ctx.fillStyle=
        getComputedStyle(el)
          .backgroundColor;

      if(el.dataset.shape==='circle'){

        ctx.beginPath();

        ctx.ellipse(
          0,
          0,
          w/2,
          h/2,
          0,
          0,
          Math.PI*2
        );

        ctx.fill();

      }else{

        ctx.fillRect(
          -w/2,
          -h/2,
          w,
          h
        );
      }

    }else if(el.querySelector('img')){

      let im=el.querySelector('img');

      if(!im.complete)
        await new Promise(ok=>im.onload=ok);

      ctx.drawImage(
        im,
        -w/2,
        -h/2,
        w,
        h
      );

    }else{

      let cs=getComputedStyle(el),
          fs=(parseFloat(cs.fontSize)||42)*sx;

      ctx.fillStyle=cs.color||'#111';

      ctx.font=
        `${cs.fontStyle} ${cs.fontWeight} ${fs}px Arial`;

      ctx.textBaseline='top';

      (el.dataset.text||'')
        .split('\n')
        .forEach((t,i)=>{

          ctx.fillText(
            t,
            -w/2+5*sx,
            -h/2+5*sy+i*fs*1.2
          );
        });
    }

    ctx.restore();
  }

  let a=document.createElement('a');

  a.download=
    `APANAM-design-${W}x${H}.png`;

  a.href=c.toDataURL('image/png');

  a.click();
}

if($('#download'))
  $('#download').onclick=exportPNG;

stage.addEventListener('click',e=>{

  if(e.target===stage)
    select(null);
});

document.addEventListener('keydown',e=>{

  if(
    (e.key==='Delete'||e.key==='Backspace') &&
    selected &&
    !['INPUT','TEXTAREA','SELECT']
      .includes(document.activeElement.tagName)
  ){

    e.preventDefault();

    if($('#delete'))
      $('#delete').click();
  }

  if(
    (e.ctrlKey||e.metaKey) &&
    e.key.toLowerCase()==='d' &&
    selected
  ){

    e.preventDefault();

    if($('#duplicate'))
      $('#duplicate').click();
  }
});

size(1080,1080);

select(null);

history=[];


/* =========================================================
   ORIGINAL APANAM TEMPLATE / EDITOR SCRIPTS
   ========================================================= */

(()=>{
  const load=()=>{

    if(
      document.getElementById('originalTemplatesV1')||
      document.querySelector(
        'script[data-apanam-original-templates]'
      )
    ) return;

    const s=document.createElement('script');

    s.src=
      'original-templates-v1.js?v=20260921-3';

    s.dataset.apanamOriginalTemplates='1';

    document.body.appendChild(s);
  };

  if(document.readyState==='loading')
    document.addEventListener(
      'DOMContentLoaded',
      load,
      {once:true}
    );
  else
    setTimeout(load,0);
})();


(()=>{
  const load=()=>{

    if(
      document.querySelector(
        'script[data-apanam-original-layer-editor]'
      )
    ) return;

    const s=document.createElement('script');

    s.src=
      'original-template-layer-editor.js?v=52f51cff';

    s.dataset.apanamOriginalLayerEditor='1';

    document.body.appendChild(s);
  };

  if(document.readyState==='loading')
    document.addEventListener(
      'DOMContentLoaded',
      load,
      {once:true}
    );
  else
    setTimeout(load,100);
})();


(()=>{
  const load=()=>{

    if(
      document.querySelector(
        'script[data-apanam-header-actions]'
      )
    ) return;

    const s=document.createElement('script');

    s.src=
      'header-edit-delete.js?v=3521d0c3';

    s.dataset.apanamHeaderActions='1';

    document.body.appendChild(s);
  };

  if(document.readyState==='loading')
    document.addEventListener(
      'DOMContentLoaded',
      load,
      {once:true}
    );
  else
    setTimeout(load,0);
})();


(()=>{
  const load=()=>{

    if(
      document.querySelector(
        'script[data-apanam-upload-drag-fix]'
      )
    ) return;

    const s=document.createElement('script');

    s.src=
      'upload-drag-fix.js?v=f78f2c75';

    s.dataset.apanamUploadDragFix='1';

    document.body.appendChild(s);
  };

  if(document.readyState==='loading')
    document.addEventListener(
      'DOMContentLoaded',
      load,
      {once:true}
    );
  else
    setTimeout(load,0);
})();


(()=>{
  const load=()=>{

    if(
      document.querySelector(
        'script[data-apanam-auto-edit-upload]'
      )
    ) return;

    const s=document.createElement('script');

    s.src=
      'auto-edit-upload.js?v=2521e1ca';

    s.dataset.apanamAutoEditUpload='1';

    document.body.appendChild(s);
  };

  if(document.readyState==='loading')
    document.addEventListener(
      'DOMContentLoaded',
      load,
      {once:true}
    );
  else
    setTimeout(load,0);
})();


(()=>{
  const load=()=>{

    if(
      document.querySelector(
        'script[data-apanam-auto-poster-text]'
      )
    ) return;

    const s=document.createElement('script');

    s.src=
      'auto-poster-text-layers.js?v=627f13ca';

    s.dataset.apanamAutoPosterText='1';

    document.body.appendChild(s);
  };

  if(document.readyState==='loading')
    document.addEventListener(
      'DOMContentLoaded',
      load,
      {once:true}
    );
  else
    setTimeout(load,0);
})();


(()=>{
  const load=()=>{

    if(
      document.querySelector(
        'script[data-apanam-all-original-layers]'
      )
    ) return;

    const s=document.createElement('script');

    s.src=
      'original-template-all-layers.js?v=4ad773cd';

    s.dataset.apanamAllOriginalLayers='1';

    document.body.appendChild(s);
  };

  if(document.readyState==='loading')
    document.addEventListener(
      'DOMContentLoaded',
      load,
      {once:true}
    );
  else
    setTimeout(load,150);
})();


(()=>{
  const load=()=>{

    if(
      document.querySelector(
        'script[data-festival-pack10]'
      )
    ) return;

    const s=document.createElement('script');

    s.src=
      'festival-pack-10.js?v=20260921-2';

    s.dataset.festivalPack10='1';

    document.body.appendChild(s);
  };

  if(document.readyState==='loading')
    document.addEventListener(
      'DOMContentLoaded',
      load,
      {once:true}
    );
  else
    setTimeout(load,320);
})();


/* APANAM E-COMMERCE PACK 18 V2 */

(()=>{
  const load=()=>{

    if(
      document.querySelector(
        'script[data-apanam-ecommerce-pack-18-v2]'
      )
    ) return;

    const s=document.createElement('script');

    s.src=
      'ecommerce-template-pack-18-v2.js?v=20260923-1';

    s.dataset.apanamEcommercePack18V2='1';

    document.body.appendChild(s);
  };

  if(document.readyState==='loading')
    document.addEventListener(
      'DOMContentLoaded',
      load,
      {once:true}
    );
  else
    setTimeout(load,500);
})();


/* =========================================================
   APANAM PHONETIC TYPING — FINAL
   Roman Hindi → हिन्दी
   Existing Phonetic input को ही use करेगा
   Existing "हिंदी में लगाएँ" button को use करेगा
   Selected canvas text में हिन्दी लगाएगा
   ========================================================= */

(()=>{
  if(window.__APANAM_PHONETIC_FINAL__)
    return;

  window.__APANAM_PHONETIC_FINAL__=true;


  /* =====================================================
     ROMAN → HINDI
     ===================================================== */

  const vowels={
    aa:'आ',
    ai:'ऐ',
    au:'औ',
    ee:'ई',
    ii:'ई',
    oo:'ऊ',
    uu:'ऊ',
    ri:'ऋ',

    a:'अ',
    i:'इ',
    u:'उ',
    e:'ए',
    o:'ओ'
  };


  const matra={
    a:'',
    aa:'ा',

    i:'ि',
    ee:'ी',
    ii:'ी',

    u:'ु',
    oo:'ू',
    uu:'ू',

    e:'े',
    ai:'ै',

    o:'ो',
    au:'ौ',

    ri:'ृ'
  };


  const consonants={
    ksh:'क्ष',
    chh:'छ',
    shr:'श्र',
    gya:'ज्ञ',
    tra:'त्र',

    kh:'ख',
    gh:'घ',
    jh:'झ',

    th:'थ',
    dh:'ध',

    ph:'फ',
    bh:'भ',

    sh:'श',
    ssh:'ष',

    kr:'क्र',
    tr:'त्र',
    dr:'द्र',
    pr:'प्र',
    br:'ब्र',
    gr:'ग्र',
    fr:'फ़्र',

    ch:'च',

    k:'क',
    g:'ग',
    c:'क',
    j:'ज',

    t:'त',
    d:'द',
    n:'न',

    p:'प',
    b:'ब',
    m:'म',

    y:'य',
    r:'र',
    l:'ल',

    v:'व',
    w:'व',

    s:'स',
    h:'ह',

    f:'फ़',
    z:'ज़',
    q:'क़',
    x:'क्स'
  };


  const vowelKeys=
    Object.keys(vowels)
      .sort((a,b)=>b.length-a.length);


  const consonantKeys=
    Object.keys(consonants)
      .sort((a,b)=>b.length-a.length);


  function getVowel(s,i){

    for(const v of vowelKeys){

      if(s.startsWith(v,i))
        return v;

    }

    return null;
  }


  function getConsonant(s,i){

    for(const c of consonantKeys){

      if(s.startsWith(c,i))
        return c;

    }

    return null;
  }


  function transliterateWord(word){

    if(!word)
      return '';

    const s=word.toLowerCase();

    let out='';
    let i=0;

    while(i<s.length){

      /* number */

      if(/[0-9]/.test(s[i])){

        out+=s[i];
        i++;

        continue;
      }


      /* punctuation */

      if(
        /[.,!?;:'"()\[\]{}\-_/+*=]/.test(s[i])
      ){

        out+=s[i];
        i++;

        continue;
      }


      /* consonant */

      const c=getConsonant(s,i);

      if(c){

        out+=consonants[c];

        i+=c.length;


        /*
          Consonant के बाद vowel
        */

        const v=getVowel(s,i);

        if(v){

          out+=matra[v];

          i+=v.length;

          continue;
        }


        /*
          अगला consonant है तो halant.
        */

        const nextC=
          getConsonant(s,i);

        if(nextC){

          /*
            पहले से बने conjunct को दोबारा
            halant नहीं देना.
          */

          if(
            ![
              'kr',
              'tr',
              'dr',
              'pr',
              'br',
              'gr',
              'fr'
            ].includes(c)
          ){

            out+='्';

          }
        }

        continue;
      }


      /* independent vowel */

      const v=getVowel(s,i);

      if(v){

        out+=vowels[v];

        i+=v.length;

        continue;
      }


      /* unknown */

      out+=s[i];

      i++;
    }


    /*
      आखिरी halant हटाएँ
    */

    out=
      out.replace(/्$/,'');

    return out;
  }


  function transliterate(text){

    if(!text)
      return '';

    return text
      .split(/(\s+)/)
      .map(part=>{

        if(/^\s+$/.test(part))
          return part;

        return transliterateWord(part);

      })
      .join('');
  }


  /* =====================================================
     EXISTING PHONETIC INPUT ढूँढना
     ===================================================== */

  function findPhoneticInput(){

    const knownIds=[
      '#phoneticInput',
      '#phoneticText',
      '#hindiPhoneticInput',
      '#apanamPhoneticInput'
    ];


    for(const id of knownIds){

      const el=
        document.querySelector(id);

      if(el)
        return el;
    }


    /*
      केवल visible text input/textarea
      खोजें.
    */

    const inputs=[
      ...document.querySelectorAll(
        'input[type="text"], textarea'
      )
    ];


    for(const input of inputs){

      /*
        Popup/dialog के input को छोड़ें.
      */

      if(
        input.closest('[role="dialog"]') ||
        input.closest('.modal') ||
        input.closest('.popup')
      )
        continue;


      if(input.offsetParent===null)
        continue;


      const info=(
        (input.placeholder||'')+
        ' '+
        (input.getAttribute('aria-label')||'')+
        ' '+
        (input.className||'')
      ).toLowerCase();


      if(
        info.includes('phonetic') ||
        info.includes('aapka naam') ||
        info.includes('mera naam')
      ){

        return input;
      }
    }


    /*
      अगर Text panel में label "Phonetic Typing"
      है तो उसके पास का input खोजें.
    */

    const nodes=[
      ...document.querySelectorAll('*')
    ];


    for(const node of nodes){

      const txt=
        (node.textContent||'')
          .replace(/\s+/g,' ')
          .trim();


      if(
        txt.includes('Phonetic Typing')
      ){

        let parent=node;


        for(
          let level=0;
          level<5 && parent;
          level++
        ){

          const found=[
            ...parent.querySelectorAll(
              'input[type="text"], textarea'
            )
          ];


          for(const input of found){

            if(
              input.closest('[role="dialog"]') ||
              input.closest('.modal') ||
              input.closest('.popup')
            )
              continue;


            if(input.offsetParent!==null)
              return input;
          }


          parent=
            parent.parentElement;
        }
      }
    }


    return null;
  }


  /* =====================================================
     EXISTING HINDI BUTTON
     ===================================================== */

  function findHindiButton(){

    const buttons=[
      ...document.querySelectorAll('button')
    ];


    for(const button of buttons){

      if(button.offsetParent===null)
        continue;


      const txt=
        (button.textContent||'')
          .replace(/\s+/g,' ')
          .trim();


      if(
        txt.includes('हिंदी में लगाएँ') ||
        txt.includes('हिन्दी में लगाएँ') ||
        txt.toLowerCase()
          .includes('apply hindi')
      ){

        return button;
      }
    }


    return null;
  }


  /* =====================================================
     SELECTED CANVAS TEXT
     ===================================================== */

  function getSelectedElement(){

    /*
      Original editor का selected variable.
    */

    try{

      if(
        typeof selected!=='undefined' &&
        selected &&
        selected.classList &&
        selected.classList.contains('element')
      ){

        return selected;
      }

    }catch(_){}


    /*
      DOM fallback.
    */

    return document.querySelector(
      '#stage .element.selected'
    );
  }


  /* =====================================================
     HINDI APPLY
     ===================================================== */

  function applyHindi(text){

    if(!text)
      return;


    const el=
      getSelectedElement();


    if(
      !el ||
      !el.classList.contains('element')
    ){

      alert(
        'पहले Poster में Text select करें।'
      );

      return;
    }


    if(el.dataset.text==null){

      alert(
        'Selected element Text नहीं है।'
      );

      return;
    }


    if(el.dataset.locked==='1')
      return;


    /*
      Undo
    */

    if(typeof snap==='function')
      snap();


    /*
      Dataset update
    */

    el.dataset.text=text;


    /*
      केवल actual text node बदलें.
      Handles सुरक्षित रहेंगे.
    */

    let textNode=
      [...el.childNodes]
        .find(
          n=>n.nodeType===Node.TEXT_NODE
        );


    if(textNode){

      textNode.nodeValue=text;

    }else{

      el.insertBefore(
        document.createTextNode(text),
        el.firstChild
      );
    }


    /*
      Existing Text Value भी update.
    */

    const textValue=
      document.querySelector('#textValue');


    if(textValue){

      textValue.value=text;
    }


    /*
      Layers refresh
    */

    if(typeof renderLayers==='function')
      renderLayers();


    /*
      Selection वापस
    */

    if(typeof select==='function')
      select(el);


    console.log(
      'APANAM Hindi Applied:',
      text
    );
  }


  /* =====================================================
     CONNECT
     ===================================================== */

  function connect(){

    const input=
      findPhoneticInput();


    if(!input)
      return false;


    if(
      input.dataset.apanamPhoneticFinal==='1'
    )
      return true;


    input.dataset.apanamPhoneticFinal='1';


    /*
      Preview
    */

    let preview=
      document.getElementById(
        'apanamPhoneticPreviewFinal'
      );


    if(!preview){

      preview=
        document.createElement('div');

      preview.id=
        'apanamPhoneticPreviewFinal';

      preview.style.cssText=`
        margin-top:4px;
        font-size:12px;
        line-height:18px;
        color:#475569;
        min-height:18px;
      `;


      input.parentElement
        ?.appendChild(preview);
    }


    /* =================================================
       LIVE ROMAN → HINDI
       ================================================= */

    input.addEventListener(
      'input',
      ()=>{

        const roman=
          input.value||'';


        const hindi=
          transliterate(roman);


        input.dataset.hindi=
          hindi;


        preview.textContent=
          hindi||
          'Roman → हिन्दी';
      }
    );


    /* =================================================
       ENTER
       ================================================= */

    input.addEventListener(
      'keydown',
      e=>{

        if(e.key==='Enter'){

          e.preventDefault();


          const hindi=
            input.dataset.hindi||
            transliterate(
              input.value||''
            );


          applyHindi(hindi);
        }
      }
    );


    /* =================================================
       EXISTING HINDI BUTTON
       ================================================= */

    const button=
      findHindiButton();


    if(
      button &&
      button.dataset.apanamFinalButton!=='1'
    ){

      button.dataset.apanamFinalButton='1';


      button.addEventListener(
        'click',
        ()=>{

          const hindi=
            input.dataset.hindi||
            transliterate(
              input.value||''
            );


          /*
            Original button के बाद apply करें.
          */

          setTimeout(
            ()=>{
              applyHindi(hindi);
            },
            50
          );

        },
        false
      );
    }


    console.log(
      'APANAM Phonetic FINAL connected:',
      input
    );


    return true;
  }


  /* =====================================================
     WAIT FOR EDITOR
     ===================================================== */

  function start(){

    if(connect())
      return;


    let tries=0;


    const timer=
      setInterval(()=>{

        tries++;


        if(connect()){

          clearInterval(timer);

          return;
        }


        if(tries>=60){

          clearInterval(timer);

          console.warn(
            'APANAM Phonetic: input नहीं मिला'
          );
        }

      },500);
  }


  if(
    document.readyState==='loading'
  ){

    document.addEventListener(
      'DOMContentLoaded',
      ()=>{
        setTimeout(start,1000);
      },
      {once:true}
    );

  }else{

    setTimeout(start,1000);
  }


})();