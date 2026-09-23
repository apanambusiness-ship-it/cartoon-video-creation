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
   APANAM PHONETIC TYPING
   Roman Hindi → हिन्दी
   SAFE INTEGRATION V2
   ========================================================= */

(()=>{
  if(window.__APANAM_PHONETIC_V2__)
    return;

  window.__APANAM_PHONETIC_V2__=true;


  /* ---------- STYLE ---------- */

  const style=document.createElement('style');

  style.id='apanamPhoneticStyle';

  style.textContent=`

    #apanamPhoneticBar{
      position:relative;
      width:calc(100% - 24px);
      margin:8px auto;
      min-height:46px;
      display:flex;
      align-items:center;
      gap:7px;
      padding:6px 9px;
      box-sizing:border-box;

      background:#ffffff;

      border:1px solid #ddd6fe;
      border-radius:12px;

      box-shadow:
        0 2px 10px
        rgba(76,29,149,.08);

      z-index:9999;

      font-family:Arial,sans-serif;
    }

    #apanamPhoneticBar .ph-title{
      font-size:11px;
      font-weight:800;
      color:#4c1d95;
      white-space:nowrap;
    }

    #apanamPhoneticBar .ph-input{
      flex:1;
      min-width:130px;
      height:32px;

      border:1px solid #d8d5e8;
      border-radius:8px;

      padding:0 9px;

      outline:none;

      font-size:13px;

      background:#fafafa;
      color:#111827;

      box-sizing:border-box;
    }

    #apanamPhoneticBar .ph-input:focus{
      border-color:#7c3aed;
      background:#fff;

      box-shadow:
        0 0 0 2px
        rgba(124,58,237,.10);
    }

    #apanamPhoneticBar select{
      height:32px;

      border:1px solid #d8d5e8;
      border-radius:8px;

      padding:0 7px;

      background:#fff;

      font-size:11px;
      color:#374151;
    }

    #apanamPhoneticBar button{
      height:32px;

      border:0;
      border-radius:8px;

      padding:0 11px;

      background:#6d28d9;
      color:#fff;

      font-weight:800;
      font-size:11px;

      cursor:pointer;
    }

    #apanamPhoneticBar button:hover{
      background:#5b21b6;
    }

    #apanamPhoneticBar .ph-status{
      font-size:10px;
      color:#64748b;
      white-space:nowrap;
      max-width:260px;
      overflow:hidden;
      text-overflow:ellipsis;
    }

    @media(max-width:800px){

      #apanamPhoneticBar{
        flex-wrap:wrap;
      }

      #apanamPhoneticBar .ph-input{
        min-width:180px;
      }
    }

  `;

  document.head.appendChild(style);


  /* ---------- TRANSLITERATION ---------- */

  const independent={

    a:'अ',
    aa:'आ',

    i:'इ',
    ee:'ई',
    ii:'ई',

    u:'उ',
    oo:'ऊ',
    uu:'ऊ',

    e:'ए',
    ai:'ऐ',

    o:'ओ',
    au:'औ',

    am:'अं',
    an:'अं',
    ah:'अः',

    ri:'ऋ'
  };


  const consonants={

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

    tr:'त्र',
    gy:'ज्ञ',

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


  function isVowelAt(s,i){

    for(const v of vowels){

      if(s.startsWith(v,i))
        return v;
    }

    return null;
  }


  function isConsonantAt(s,i){

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

    let afterConsonant=false;


    while(i<s.length){

      /* numbers */

      if(/[0-9]/.test(s[i])){

        out+=s[i++];

        afterConsonant=false;

        continue;
      }


      /* punctuation */

      if(/[.,!?;:'"()\[\]{}\-_/+*=]/.test(s[i])){

        out+=s[i++];

        afterConsonant=false;

        continue;
      }


      /* special combinations */

      if(s.startsWith('ksh',i)){

        out+='क्ष';

        i+=3;

        afterConsonant=true;

        continue;
      }


      if(s.startsWith('shr',i)){

        out+='श्र';

        i+=3;

        afterConsonant=true;

        continue;
      }


      if(s.startsWith('dr',i)){

        out+='द्र';

        i+=2;

        afterConsonant=true;

        continue;
      }


      if(s.startsWith('kr',i)){

        out+='क्र';

        i+=2;

        afterConsonant=true;

        continue;
      }


      const c=isConsonantAt(s,i);


      if(c){

        out+=consonants[c];

        i+=c.length;

        afterConsonant=true;


        const v=isVowelAt(s,i);


        if(v){

          out+=matra[v];

          i+=v.length;

          afterConsonant=false;

        }else{

          /*
            Do not create unnecessary halant
            before another consonant.
          */

          if(
            i<s.length &&
            !isConsonantAt(s,i)
          ){

            out+='्';
          }
        }

        continue;
      }


      const v=isVowelAt(s,i);


      if(v){

        if(afterConsonant){

          out+=matra[v];

          afterConsonant=false;

        }else{

          out+=independent[v];
        }

        i+=v.length;

        continue;
      }


      out+=s[i];

      i++;

      afterConsonant=false;
    }


    out=out.replace(/्$/,'');

    return out;
  }


  function transliterate(text){

    return text
      .split(/(\s+)/)
      .map(part=>
        /^\s+$/.test(part)
          ?part
          :transliterateWord(part)
      )
      .join('');
  }


  /* ---------- CREATE BAR ---------- */

  function createBar(){

    if(
      document.getElementById(
        'apanamPhoneticBar'
      )
    ) return;


    const bar=document.createElement('div');

    bar.id='apanamPhoneticBar';


    bar.innerHTML=`

      <span class="ph-title">
        ⌨ Phonetic Typing
      </span>

      <select id="apanamPhoneticLanguage">

        <option value="hi">
          हिन्दी
        </option>

        <option value="en">
          English
        </option>

      </select>

      <input
        id="apanamPhoneticInput"
        class="ph-input"
        type="text"
        placeholder="mera naam kya hai"
        autocomplete="off"
        spellcheck="false"
      >

      <button
        id="apanamPhoneticApply"
        type="button"
      >
        हिंदी में लगाएँ
      </button>

      <span
        id="apanamPhoneticStatus"
        class="ph-status"
      >
        Roman → हिन्दी
      </span>

    `;


    /*
      IMPORTANT:

      Bar को stage के parent में डाल रहे हैं,
      लेकिन stage के अंदर नहीं।

      इससे canvas के elements खराब नहीं होंगे।
    */

    const st=document.querySelector('#stage');


    if(st && st.parentElement){

      st.parentElement.insertBefore(
        bar,
        st
      );

    }else{

      document.body.insertBefore(
        bar,
        document.body.firstChild
      );
    }


    const input=
      document.getElementById(
        'apanamPhoneticInput'
      );

    const apply=
      document.getElementById(
        'apanamPhoneticApply'
      );

    const language=
      document.getElementById(
        'apanamPhoneticLanguage'
      );

    const status=
      document.getElementById(
        'apanamPhoneticStatus'
      );


    /* ---------- PUT TEXT ---------- */

    function putText(text){

      if(!text)
        return;


      /*
        First update normal editor input.
      */

      const textValue=
        document.querySelector(
          '#textValue'
        );


      if(textValue){

        textValue.value=text;

        textValue.dispatchEvent(
          new Event(
            'input',
            {bubbles:true}
          )
        );

        textValue.dispatchEvent(
          new Event(
            'change',
            {bubbles:true}
          )
        );
      }


      /*
        Then update selected canvas text.
      */

      const current=
        document.querySelector(
          '#stage .element.selected'
        );


      if(
        current &&
        current.dataset.text!=null
      ){

        current.dataset.text=text;


        let textNode=
          [...current.childNodes]
            .find(
              n=>n.nodeType===Node.TEXT_NODE
            );


        if(textNode){

          textNode.nodeValue=text;

        }else{

          current.insertBefore(
            document.createTextNode(text),
            current.firstChild
          );
        }


        /*
          Layer list update.
        */

        if(
          typeof renderLayers==='function'
        ){

          renderLayers();
        }
      }


      status.textContent=
        '✓ हिन्दी text तैयार';

      status.style.color=
        '#15803d';
    }


    /* ---------- LIVE CONVERSION ---------- */

    input.addEventListener(
      'input',
      ()=>{

        if(language.value!=='hi'){

          status.textContent=
            'English mode';

          status.style.color=
            '#64748b';

          return;
        }


        const converted=
          transliterate(input.value);


        input.dataset.hindi=
          converted;


        if(converted){

          status.textContent=
            converted;

          status.style.color=
            '#475569';

        }else{

          status.textContent=
            'Roman → हिन्दी';

          status.style.color=
            '#64748b';
        }
      }
    );


    /* ---------- APPLY ---------- */

    apply.addEventListener(
      'click',
      ()=>{

        let converted=
          input.dataset.hindi||
          transliterate(input.value);


        putText(converted);
      }
    );


    /* ---------- ENTER ---------- */

    input.addEventListener(
      'keydown',
      e=>{

        if(e.key==='Enter'){

          e.preventDefault();

          apply.click();
        }
      }
    );
  }


  /* ---------- START AFTER EDITOR ---------- */

  function start(){

    if(
      document.getElementById(
        'apanamPhoneticBar'
      )
    ) return;

    createBar();
  }


  /*
    थोड़ा delay इसलिए रखा है ताकि
    original template scripts पहले load हो जाएँ।
  */

  if(
    document.readyState==='loading'
  ){

    document.addEventListener(
      'DOMContentLoaded',
      ()=>{
        setTimeout(start,700);
      },
      {once:true}
    );

  }else{

    setTimeout(start,700);
  }

})();
/* =========================================================
   APANAM PHONETIC TYPING — V3 FINAL FIX
   Roman Hindi → हिन्दी
   IMPORTANT:
   यह block पुराने V1/V2 phonetic system को override करता है।
   बाकी editor code को touch नहीं करता।
   ========================================================= */

(()=>{
  /* ---------- STOP OLD PHONETIC SYSTEMS ---------- */

  window.__APANAM_PHONETIC_V3__ = true;

  /*
    पुराने bar को हटाओ ताकि duplicate bar न बने।
  */
  const oldBar=document.getElementById('apanamPhoneticBar');

  if(oldBar){
    oldBar.remove();
  }


  /* =====================================================
     STYLE
     ===================================================== */

  if(!document.getElementById('apanamPhoneticV3Style')){

    const style=document.createElement('style');

    style.id='apanamPhoneticV3Style';

    style.textContent=`

      #apanamPhoneticBarV3{
        position:relative;
        width:calc(100% - 24px);
        margin:8px auto;

        min-height:48px;

        display:flex;
        align-items:center;

        gap:7px;

        padding:7px 9px;

        box-sizing:border-box;

        background:#fff;

        border:1px solid #ddd6fe;

        border-radius:12px;

        box-shadow:
          0 2px 10px
          rgba(76,29,149,.08);

        z-index:9999;

        font-family:Arial,sans-serif;
      }

      #apanamPhoneticBarV3 .ph-title{
        font-size:11px;
        font-weight:800;

        color:#4c1d95;

        white-space:nowrap;
      }

      #apanamPhoneticBarV3 .ph-input{
        flex:1;

        min-width:150px;

        height:34px;

        border:1px solid #d8d5e8;

        border-radius:8px;

        padding:0 10px;

        outline:none;

        font-size:14px;

        background:#fafafa;

        color:#111827;

        box-sizing:border-box;
      }

      #apanamPhoneticBarV3 .ph-input:focus{
        border-color:#7c3aed;

        background:#fff;

        box-shadow:
          0 0 0 2px
          rgba(124,58,237,.10);
      }

      #apanamPhoneticBarV3 .ph-preview{
        min-width:100px;
        max-width:260px;

        font-size:14px;
        font-weight:600;

        color:#374151;

        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
      }

      #apanamPhoneticBarV3 button{
        height:34px;

        border:0;

        border-radius:8px;

        padding:0 13px;

        background:#6d28d9;

        color:#fff;

        font-weight:800;

        font-size:12px;

        cursor:pointer;
      }

      #apanamPhoneticBarV3 button:hover{
        background:#5b21b6;
      }

      #apanamPhoneticBarV3 .ph-status{
        font-size:10px;

        color:#64748b;

        white-space:nowrap;
      }

      @media(max-width:800px){

        #apanamPhoneticBarV3{
          flex-wrap:wrap;
        }

        #apanamPhoneticBarV3 .ph-input{
          min-width:180px;
        }

        #apanamPhoneticBarV3 .ph-preview{
          width:100%;
          max-width:none;
          order:5;
        }

      }

    `;

    document.head.appendChild(style);
  }


  /* =====================================================
     BASIC DATA
     ===================================================== */

  const vowels={

    'aa':'आ',
    'ai':'ऐ',
    'au':'औ',

    'ee':'ई',
    'ii':'ई',

    'oo':'ऊ',
    'uu':'ऊ',

    'a':'अ',
    'i':'इ',
    'u':'उ',

    'e':'ए',
    'o':'ओ',

    'ri':'ऋ'
  };


  const matras={

    'a':'',
    'aa':'ा',

    'i':'ि',
    'ee':'ी',
    'ii':'ी',

    'u':'ु',
    'oo':'ू',
    'uu':'ू',

    'e':'े',
    'ai':'ै',

    'o':'ो',
    'au':'ौ',

    'ri':'ृ'
  };


  const consonants={

    'ksh':'क्ष',

    'chh':'छ',

    'jh':'झ',

    'kh':'ख',
    'gh':'घ',

    'ch':'च',

    'th':'थ',
    'dh':'ध',

    'ph':'फ',
    'bh':'भ',

    'sh':'श',

    'tr':'त्र',

    'gy':'ज्ञ',

    'kr':'क्र',
    'gr':'ग्र',
    'pr':'प्र',
    'br':'ब्र',
    'dr':'द्र',
    'fr':'फ्र',

    'kl':'क्ल',
    'pl':'प्ल',
    'bl':'ब्ल',

    'st':'स्त',
    'sp':'स्प',
    'sk':'स्क',
    'sm':'स्म',
    'sn':'स्न',

    'sw':'स्व',

    'ky':'क्य',
    'ty':'त्य',
    'dy':'द्य',
    'ny':'न्य',

    'my':'म्य',
    'py':'प्य',
    'by':'ब्य',

    'sy':'स्य',

    'hy':'ह्य',

    'k':'क',
    'g':'ग',

    'c':'क',

    'j':'ज',

    't':'त',
    'd':'द',
    'n':'न',

    'p':'प',
    'b':'ब',
    'm':'म',

    'y':'य',
    'r':'र',
    'l':'ल',

    'v':'व',
    'w':'व',

    's':'स',
    'h':'ह',

    'f':'फ़',
    'z':'ज़',

    'q':'क़',
    'x':'क्स'
  };


  const vowelKeys=
    Object.keys(vowels)
      .sort((a,b)=>b.length-a.length);

  const consonantKeys=
    Object.keys(consonants)
      .sort((a,b)=>b.length-a.length);


  /* =====================================================
     HELPERS
     ===================================================== */

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


  function isRomanLetter(ch){

    return /[a-z]/i.test(ch);
  }


  /* =====================================================
     WORD CONVERTER
     ===================================================== */

  function convertWord(word){

    if(!word)
      return '';

    const s=word.toLowerCase();

    let out='';

    let i=0;


    while(i<s.length){

      /* -----------------------------------------------
         SPACE
         ----------------------------------------------- */

      if(/\s/.test(s[i])){

        out+=s[i];

        i++;

        continue;
      }


      /* -----------------------------------------------
         NUMBERS
         ----------------------------------------------- */

      if(/[0-9]/.test(s[i])){

        out+=s[i];

        i++;

        continue;
      }


      /* -----------------------------------------------
         PUNCTUATION
         ----------------------------------------------- */

      if(
        /[.,!?;:'"()[\]{}\-_/+*=@#$%&]/.test(s[i])
      ){

        out+=s[i];

        i++;

        continue;
      }


      /* -----------------------------------------------
         CONSONANT
         ----------------------------------------------- */

      const c=getConsonant(s,i);

      if(c){

        out+=consonants[c];

        i+=c.length;


        /*
          Check vowel immediately after consonant.
        */

        const v=getVowel(s,i);


        if(v){

          /*
            Consonant + vowel
          */

          out+=matras[v];

          i+=v.length;

          continue;
        }


        /*
          अगर अगला अक्षर दूसरा consonant है,
          तो halant लगाओ।

          उदाहरण:

          namla

          न + म + ला
        */

        const nextC=getConsonant(s,i);

        if(nextC){

          /*
            कुछ सामान्य clusters ऊपर पहले ही
            defined हैं।
          */

          out+='्';

          continue;
        }


        /*
          कोई vowel/consonant नहीं है।
          Hindi में consonant का inherent "a"
          माना जाएगा।

          उदाहरण:

          mera

          m + e = मे
          r + a = रा

          इसलिए यहाँ कोई हलंत नहीं।
        */

        continue;
      }


      /* -----------------------------------------------
         STANDALONE VOWEL
         ----------------------------------------------- */

      const v=getVowel(s,i);

      if(v){

        out+=vowels[v];

        i+=v.length;

        continue;
      }


      /* -----------------------------------------------
         UNKNOWN CHARACTER
         ----------------------------------------------- */

      out+=s[i];

      i++;
    }


    return out;
  }


  /* =====================================================
     FULL TEXT CONVERTER
     ===================================================== */

  function transliterate(text){

    if(!text)
      return '';

    return text
      .split(/(\s+)/)
      .map(part=>{

        if(/^\s+$/.test(part))
          return part;

        return convertWord(part);

      })
      .join('');
  }


  /* =====================================================
     CREATE BAR
     ===================================================== */

  function createBar(){

    /*
      Duplicate protection
    */

    if(
      document.getElementById(
        'apanamPhoneticBarV3'
      )
    ){

      return;
    }


    const bar=document.createElement('div');

    bar.id='apanamPhoneticBarV3';


    bar.innerHTML=`

      <span class="ph-title">
        ⌨ Phonetic
      </span>

      <input
        id="apanamPhoneticInputV3"
        class="ph-input"
        type="text"
        placeholder="mera naam kya hai"
        autocomplete="off"
        spellcheck="false"
      >

      <span
        id="apanamPhoneticPreviewV3"
        class="ph-preview"
      >
        मेरा नाम क्या है
      </span>

      <button
        id="apanamPhoneticApplyV3"
        type="button"
      >
        हिंदी में लगाएँ
      </button>

      <span
        id="apanamPhoneticStatusV3"
        class="ph-status"
      >
        Roman → हिन्दी
      </span>

    `;


    /* -----------------------------------------------
       INSERT ABOVE STAGE
       ----------------------------------------------- */

    const st=document.querySelector('#stage');


    if(st && st.parentElement){

      st.parentElement.insertBefore(
        bar,
        st
      );

    }else{

      document.body.insertBefore(
        bar,
        document.body.firstChild
      );
    }


    /* -----------------------------------------------
       ELEMENTS
       ----------------------------------------------- */

    const input=
      document.getElementById(
        'apanamPhoneticInputV3'
      );


    const preview=
      document.getElementById(
        'apanamPhoneticPreviewV3'
      );


    const apply=
      document.getElementById(
        'apanamPhoneticApplyV3'
      );


    const status=
      document.getElementById(
        'apanamPhoneticStatusV3'
      );


    /* -----------------------------------------------
       UPDATE PREVIEW
       ----------------------------------------------- */

    function updatePreview(){

      const roman=input.value;

      const hindi=
        transliterate(roman);


      input.dataset.hindi=hindi;


      if(hindi){

        preview.textContent=hindi;

        status.textContent=
          '✓ तैयार';

        status.style.color=
          '#15803d';

      }else{

        preview.textContent=
          'हिन्दी यहाँ दिखेगी';

        status.textContent=
          'Roman → हिन्दी';

        status.style.color=
          '#64748b';
      }
    }


    /* -----------------------------------------------
       PUT INTO EDITOR
       ----------------------------------------------- */

    function putIntoEditor(text){

      if(!text)
        return;


      /*
        सबसे पहले selected element खोजो।
      */

      let current=
        document.querySelector(
          '#stage .element.selected'
        );


      /*
        अगर selected text नहीं है,
        तो normal #textValue को update करो।
      */

      const textValue=
        document.querySelector(
          '#textValue'
        );


      if(current && current.dataset.text!=null){

        /*
          History सुरक्षित रखो।
        */

        if(typeof snap==='function')
          snap();


        current.dataset.text=text;


        /*
          केवल actual text node बदलो।
          handles को नहीं छेड़ना।
        */

        let textNode=
          [...current.childNodes]
            .find(
              n=>n.nodeType===Node.TEXT_NODE
            );


        if(textNode){

          textNode.nodeValue=text;

        }else{

          /*
            अगर text node नहीं मिला,
            तो handles से पहले text node डालो।
          */

          const node=
            document.createTextNode(text);

          current.insertBefore(
            node,
            current.firstChild
          );
        }


        /*
          Existing textValue भी sync करो।
        */

        if(textValue)
          textValue.value=text;


        /*
          Layer list refresh
        */

        if(typeof renderLayers==='function')
          renderLayers();


        /*
          Re-select ताकि selected handles बने रहें।
        */

        if(typeof select==='function')
          select(current);


        status.textContent=
          '✓ Text canvas में लग गया';

        status.style.color=
          '#15803d';

        return;
      }


      /*
        अगर कोई canvas text selected नहीं है,
        तो सिर्फ editor input में डालो।
      */

      if(textValue){

        textValue.value=text;

        textValue.dispatchEvent(
          new Event(
            'input',
            {bubbles:true}
          )
        );

        textValue.dispatchEvent(
          new Event(
            'change',
            {bubbles:true}
          )
        );


        status.textContent=
          '✓ Text input में लग गया';

        status.style.color=
          '#15803d';

        return;
      }


      /*
        कोई selected text नहीं मिला।
      */

      status.textContent=
        'पहले Text चुनें';

      status.style.color=
        '#b91c1c';
    }


    /* -----------------------------------------------
       LIVE INPUT
       ----------------------------------------------- */

    input.addEventListener(
      'input',
      updatePreview
    );


    /* -----------------------------------------------
       APPLY BUTTON
       ----------------------------------------------- */

    apply.addEventListener(
      'click',
      ()=>{

        const hindi=
          input.dataset.hindi ||
          transliterate(input.value);


        putIntoEditor(hindi);
      }
    );


    /* -----------------------------------------------
       ENTER KEY
       ----------------------------------------------- */

    input.addEventListener(
      'keydown',
      e=>{

        if(e.key==='Enter'){

          e.preventDefault();

          apply.click();
        }

      }
    );


    /*
      Initial preview
    */

    updatePreview();
  }


  /* =====================================================
     START
     ===================================================== */

  function start(){

    /*
      अगर V3 पहले से लगा है तो दोबारा नहीं।
    */

    if(
      document.getElementById(
        'apanamPhoneticBarV3'
      )
    )
      return;


    createBar();
  }


  /*
    Editor और बाकी original scripts को
    पहले load होने का समय दो।
  */

  if(
    document.readyState==='loading'
  ){

    document.addEventListener(
      'DOMContentLoaded',
      ()=>{
        setTimeout(start,1200);
      },
      {once:true}
    );

  }else{

    setTimeout(start,1200);
  }

})();