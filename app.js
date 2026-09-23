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
   APANAM PHONETIC TYPING — FIXED V3
   Roman Hindi → हिन्दी
   Uses existing Text panel.
   DOES NOT CREATE A SECOND PHONETIC BAR.
   ========================================================= */

(()=>{
  if(window.__APANAM_PHONETIC_V3__)
    return;

  window.__APANAM_PHONETIC_V3__=true;

  /* -------------------------------------------------------
     ROMAN → HINDI
     ------------------------------------------------------- */

  const independent={
    aa:'आ',
    ai:'ऐ',
    au:'औ',
    ee:'ई',
    ii:'ई',
    oo:'ऊ',
    uu:'ऊ',
    ri:'ऋ',
    am:'अं',
    an:'अं',
    ah:'अः',

    a:'अ',
    i:'इ',
    u:'उ',
    e:'ए',
    o:'ओ'
  };

  const consonants={
    ksh:'क्ष',
    shr:'श्र',
    tra:'त्र',
    gya:'ज्ञ',

    kh:'ख',
    gh:'घ',
    chh:'छ',
    ch:'च',
    jh:'झ',
    th:'थ',
    dh:'ध',
    ph:'फ',
    bh:'भ',
    sh:'श',
    ssh:'ष',

    kr:'क्र',
    dr:'द्र',
    tr:'त्र',

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

  const vowels=Object.keys(independent)
    .sort((a,b)=>b.length-a.length);

  const cons=Object.keys(consonants)
    .sort((a,b)=>b.length-a.length);


  function getVowel(s,i){

    for(const v of vowels){
      if(s.startsWith(v,i))
        return v;
    }

    return null;
  }


  function getConsonant(s,i){

    for(const c of cons){
      if(s.startsWith(c,i))
        return c;
    }

    return null;
  }


  function transliterateWord(word){

    if(!word)
      return '';

    let s=word.toLowerCase();

    let out='';
    let i=0;

    while(i<s.length){

      /* numbers */
      if(/[0-9]/.test(s[i])){
        out+=s[i];
        i++;
        continue;
      }


      /* punctuation */
      if(/[.,!?;:'"()\[\]{}\-_/+*=]/.test(s[i])){
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
           Check vowel immediately after consonant.
        */
        const v=getVowel(s,i);

        if(v){

          out+=matra[v];

          i+=v.length;

        }else{

          /*
             If another consonant follows,
             keep conjunct without halant.
          */

          const nextC=getConsonant(s,i);

          if(!nextC && i<s.length){

            /*
               Unknown character / vowel आने वाला है.
               हलन्त नहीं डालना.
            */
          }
        }

        continue;
      }


      /* vowel */
      const v=getVowel(s,i);

      if(v){

        out+=independent[v];

        i+=v.length;

        continue;
      }


      /* unknown character */
      out+=s[i];

      i++;
    }

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


  /* -------------------------------------------------------
     FIND EXISTING PHONETIC INPUT
     ------------------------------------------------------- */

  function findPhoneticInput(){

    /*
       पहले known IDs खोजें.
    */

    const ids=[
      '#phoneticInput',
      '#phoneticText',
      '#hindiPhoneticInput',
      '#apanamPhoneticInput'
    ];

    for(const id of ids){

      const el=document.querySelector(id);

      if(el)
        return el;
    }


    /*
       फिर Text panel में input खोजें.
    */

    const allInputs=[
      ...document.querySelectorAll(
        'input[type="text"], textarea'
      )
    ];

    for(const el of allInputs){

      const ph=(
        el.placeholder+
        ' '+
        el.getAttribute('aria-label')+
        ' '+
        el.className
      ).toLowerCase();

      if(
        ph.includes('phonetic')||
        ph.includes('aapka naam')||
        ph.includes('mera naam')
      ){

        return el;
      }
    }

    return null;
  }


  /* -------------------------------------------------------
     FIND EXISTING HINDI BUTTON
     ------------------------------------------------------- */

  function findHindiButton(){

    const buttons=[
      ...document.querySelectorAll('button')
    ];

    for(const b of buttons){

      const txt=
        (b.textContent||'')
          .replace(/\s+/g,' ')
          .trim()
          .toLowerCase();

      if(
        txt.includes('हिंदी में')||
        txt.includes('हिन्दी में')||
        txt.includes('apply hindi')
      ){

        return b;
      }
    }

    return null;
  }


  /* -------------------------------------------------------
     UPDATE SELECTED CANVAS TEXT
     ------------------------------------------------------- */

  function applyHindi(text){

    if(!text)
      return;


    /*
       selected variable हमारा original editor वाला
       selected element है.
    */

    let el=
      window.selected ||
      document.querySelector(
        '#stage .element.selected'
      );


    /*
       अगर window.selected नहीं है,
       तो DOM से selected element लें.
    */

    if(
      !el ||
      !el.classList ||
      !el.classList.contains('element')
    ){

      el=document.querySelector(
        '#stage .element.selected'
      );
    }


    if(
      !el ||
      el.dataset.text==null
    ){

      console.warn(
        'APANAM phonetic: text element selected नहीं है.'
      );

      return;
    }


    if(el.dataset.locked==='1')
      return;


    /*
       Undo history.
    */

    if(typeof snap==='function')
      snap();


    /*
       Save text.
    */

    el.dataset.text=text;


    /*
       Handles को बचाकर सिर्फ text node बदलें.
    */

    let textNode=
      [...el.childNodes]
        .find(n=>n.nodeType===Node.TEXT_NODE);


    if(textNode){

      textNode.nodeValue=text;

    }else{

      /*
         Text node नहीं मिला तो नया बनाएं.
       */

      const node=
        document.createTextNode(text);

      el.insertBefore(
        node,
        el.firstChild
      );
    }


    /*
       Existing editor input भी update करें.
    */

    const textValue=
      document.querySelector('#textValue');

    if(textValue){

      textValue.value=text;

      /*
         Original editor का input handler चलाएं.
      */

      textValue.dispatchEvent(
        new Event(
          'input',
          {bubbles:true}
        )
      );
    }


    /*
       Layers refresh.
    */

    if(typeof renderLayers==='function')
      renderLayers();


    /*
       फिर से selected करें.
    */

    if(typeof select==='function')
      select(el);

  }


  /* -------------------------------------------------------
     CONNECT EXISTING INPUT
     ------------------------------------------------------- */

  function connect(){

    const input=findPhoneticInput();

    if(!input){

      console.log(
        'APANAM phonetic: existing input अभी नहीं मिला.'
      );

      return false;
    }


    /*
       Same input पर दो बार listener नहीं लगाना.
    */

    if(input.dataset.apanamPhoneticConnected==='1')
      return true;

    input.dataset.apanamPhoneticConnected='1';


    /*
       Hindi preview element.
    */

    let preview=
      document.getElementById(
        'apanamPhoneticPreview'
      );


    if(!preview){

      preview=document.createElement('span');

      preview.id=
        'apanamPhoneticPreview';

      preview.style.display='block';
      preview.style.fontSize='12px';
      preview.style.marginTop='4px';
      preview.style.color='#475569';
      preview.style.minHeight='16px';

      input.parentElement
        ?.appendChild(preview);
    }


    /*
       Live conversion.
    */

    input.addEventListener(
      'input',
      ()=>{

        const roman=input.value||'';

        const hindi=
          transliterate(roman);

        input.dataset.hindi=hindi;

        preview.textContent=
          hindi||
          'Roman → हिन्दी';

      }
    );


    /*
       Enter = apply.
    */

    input.addEventListener(
      'keydown',
      e=>{

        if(e.key==='Enter'){

          e.preventDefault();

          const hindi=
            input.dataset.hindi||
            transliterate(input.value);

          applyHindi(hindi);
        }
      }
    );


    /*
       Existing Hindi button को hook करें.
    */

    const btn=findHindiButton();

    if(btn && btn.dataset.apanamPhoneticButton!=='1'){

      btn.dataset.apanamPhoneticButton='1';


      btn.addEventListener(
        'click',
        e=>{

          /*
             Existing button का original code भी चल सकता है,
             इसलिए पहले conversion तैयार रखें.
          */

          const hindi=
            input.dataset.hindi||
            transliterate(input.value);

          /*
             थोड़ी देर बाद हमारा selected text update.
          */

          setTimeout(()=>{
            applyHindi(hindi);
          },20);

        },
        true
      );
    }


    console.log(
      'APANAM Phonetic V3 connected.'
    );

    return true;
  }


  /* -------------------------------------------------------
     WAIT FOR EXISTING EDITOR
     ------------------------------------------------------- */

  function start(){

    /*
       बार-बार नया UI नहीं बनाना.
    */

    if(connect())
      return;


    /*
       Original template scripts देर से load हों तो
       थोड़ी देर बाद दोबारा try करें.
    */

    let tries=0;

    const timer=setInterval(()=>{

      tries++;

      if(connect() || tries>30){

        clearInterval(timer);

      }

    },500);
  }


  if(document.readyState==='loading'){

    document.addEventListener(
      'DOMContentLoaded',
      ()=>{
        setTimeout(start,800);
      },
      {once:true}
    );

  }else{

    setTimeout(start,800);
  }

})();