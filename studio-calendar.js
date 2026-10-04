(()=>{'use strict';const key='apanam-personal-calendar-v1';let verified=[];const validDate=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v||''))return false;const d=new Date(v+'T00:00:00Z');return Number.isFinite(+d)&&d.toISOString().slice(0,10)===v;};
const normalize=e=>({id:String(e.id||'').slice(0,120),title:String(e.title||'').trim().slice(0,100),date:e.date,repeatYearly:e.repeatYearly===true,type:['birth','death','festival'].includes(e.type)?e.type:'festival',source:/^https:\/\//.test(e.source||'')?e.source:'',personal:e.personal===true});
function personal(){try{const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?data.filter(e=>e&&validDate(e.date)).map(normalize):[];}catch{return [];}}
const ready=fetch('./studio-calendar-events.json',{cache:'no-store',signal:AbortSignal.timeout(8000)}).then(r=>{if(!r.ok)throw Error('Calendar unavailable');return r.json();}).then(d=>{verified=(d.events||[]).filter(e=>e&&validDate(e.date)).map(normalize);}).catch(error=>console.warn(error.message));
function events(date){if(!validDate(date))return [];return [...verified,...personal()].filter(e=>(e.repeatYearly?e.date.slice(5)===date.slice(5):e.date===date)&&(!e.repeatYearly||date>=e.date));}
const designs=[
{name:'सुनहरा उत्सव',bg:'#fff5db',ink:'#653513',accent:'#bf791f',paint:'radial-gradient(circle at 85% 15%,#ffe69b 0 16%,transparent 17%),linear-gradient(145deg,#fff8e7,#f2cf86)',art:[36,220,468,240],headline:[34,85,472,110],greeting:[34,184,472,36],align:'center'},
{name:'नीला आकाश',bg:'#102c52',ink:'#fff5cf',accent:'#76d8ec',paint:'radial-gradient(ellipse at 10% 90%,#146b84,transparent 60%),linear-gradient(150deg,#071c36,#20547e)',art:[280,145,230,320],headline:[30,150,240,150],greeting:[30,325,235,65],align:'left'},
{name:'फूलों का आँगन',bg:'#fff1f5',ink:'#77394e',accent:'#c87190',paint:'radial-gradient(circle at 0 0,#f4bace 0 18%,transparent 19%),radial-gradient(circle at 100% 100%,#e0c6e9 0 24%,transparent 25%),linear-gradient(135deg,#fff8f4,#fce2ee)',art:[135,175,270,260],headline:[35,68,470,90],greeting:[35,446,470,50],align:'center'},
{name:'हरित परंपरा',bg:'#e9f4df',ink:'#234b35',accent:'#56945e',paint:'repeating-linear-gradient(45deg,transparent 0 30px,#ffffff44 30px 32px),linear-gradient(135deg,#f4faeb,#bbd9b5)',art:[24,145,230,325],headline:[276,170,240,125],greeting:[276,322,240,80],align:'left'},
{name:'बैंगनी समारोह',bg:'#2f194e',ink:'#ffefd7',accent:'#dda9ee',paint:'radial-gradient(circle at 90% 10%,#9663aa,transparent 40%),linear-gradient(135deg,#221439,#624176)',art:[30,35,480,245],headline:[35,300,470,105],greeting:[35,422,470,45],align:'center'}
];
function posters(date,templates){
  if(!validDate(date))return [];
  const out=[];
  for(const event of events(date)){
    const category=event.type==='birth'?'जयंती':event.type==='death'?'पुण्यतिथि':'त्योहार';
    const matching=templates.find(t=>t.published&&t.id.startsWith('apanam-festival-')&&t.occasion===event.title);
    let art='';if(matching){const source=document.createElement('template');source.innerHTML=matching.project.html;art=source.content.querySelector('img')?.getAttribute('src')||'';}
    designs.forEach((design,index)=>{
      if(index===0&&matching){
        const copy=structuredClone(matching),original=document.createElement('template');
        original.innerHTML=copy.project.html;
        const headline=original.content.querySelector('[data-name="त्योहार का नाम"]');
        if(headline)headline.dataset.name='अवसर का नाम';
        let dateLayer=original.content.querySelector('[data-name="तारीख"]');
        if(!dateLayer){
          dateLayer=document.createElement('div');
          dateLayer.className='element text';dateLayer.dataset.type='text';dateLayer.dataset.name='तारीख';
          Object.assign(dateLayer.style,{position:'absolute',left:'28px',top:'28px',width:'456px',height:'30px',boxSizing:'border-box',fontFamily:'Arial,sans-serif',fontSize:'17px',fontWeight:'700',textAlign:'center',color:headline?.style.color||'#5d301b',zIndex:'4'});
          original.content.append(dateLayer);
        }
        dateLayer.textContent=dateLayer.dataset.text=new Intl.DateTimeFormat('hi-IN',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'));
        copy.project.html=original.innerHTML;
        Object.assign(copy,{id:'calendar-'+event.id+'-design-1-'+date,name:event.title+' · पहले वाला मूल Poster',category,eventDate:date,repeatYearly:false,occasion:event.title});
        out.push(copy);
        return;
      }
      const doc=document.createElement('template');
      function layer(name,rect,css,text,slot){const node=document.createElement('div');node.className='element'+(text!==undefined?' text':' locked');node.dataset.name=name;Object.assign(node.style,{position:'absolute',left:rect[0]+'px',top:rect[1]+'px',width:rect[2]+'px',height:rect[3]+'px',boxSizing:'border-box',...css});if(text!==undefined){node.dataset.type='text';node.dataset.text=text;node.textContent=text;if(slot)node.dataset.brandSlot=slot;}else{node.dataset.locked='1';}doc.content.append(node);return node;}
      layer('Background · '+design.name,[0,0,540,540],{background:design.paint,zIndex:'0'});
      layer('सजावटी किनारा',[16,16,508,508],{border:'2px solid '+design.accent,borderRadius:index===2?'70px 8px':'16px',zIndex:'1'});
      if(art){const frame=layer('अवसर का चित्र',design.art,{overflow:'hidden',borderRadius:index===2?'50%':'18px',zIndex:'2'}),image=document.createElement('img');image.setAttribute('src',art);image.alt=event.title;Object.assign(image.style,{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center bottom'});frame.append(image);}else{layer('अवसर की सजावट',design.art,{background:'radial-gradient(circle,'+design.accent+'88,transparent 68%)',border:'3px double '+design.accent,borderRadius:index===2?'50%':'30px',zIndex:'2'});}
      const textStyle={fontFamily:'Arial,sans-serif',color:design.ink,whiteSpace:'pre-wrap',overflowWrap:'break-word',lineHeight:'1.25',zIndex:'4'};
      const headingSize=event.title.length>28?25:event.title.length>18?30:38;
      layer('अवसर का नाम',design.headline,{...textStyle,fontSize:headingSize+'px',fontWeight:'700',textAlign:design.align},event.title);
      const phrase=event.type==='death'?'विनम्र श्रद्धांजलि':event.type==='birth'?'सादर नमन':'हार्दिक शुभकामनाएँ';
      layer('शुभकामना',design.greeting,{...textStyle,fontSize:'22px',textAlign:design.align},phrase);
      layer('तारीख',[34,30,472,30],{...textStyle,fontSize:'16px',textAlign:index===4?'right':'center'},new Intl.DateTimeFormat('hi-IN',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z')));
      layer('नामपट्टी',[28,476,484,48],{background:design.bg,border:'1px solid '+design.accent,borderRadius:'10px',zIndex:'3'});
      layer('संस्था',[38,482,235,34],{...textStyle,fontSize:'18px',fontWeight:'700',textAlign:'left'},'आपकी संस्था','organization');
      layer('आपका नाम',[281,482,221,34],{...textStyle,fontSize:'18px',fontWeight:'700',textAlign:'right'},'आपका नाम','person');
      out.push({id:'calendar-'+event.id+'-design-'+(index+1)+'-'+date,name:event.title+' · '+design.name,category,published:true,eventDate:date,repeatYearly:false,occasion:event.title,project:{version:2,width:1080,height:1080,bgColor:design.bg,bgImage:'',transparent:false,html:doc.innerHTML}});
    });
  }
  return out;
}
function add(value){if(!validDate(value.date)||!String(value.title||'').trim())throw Error('नाम और सही तारीख भरें।');const list=personal();if(list.length>=100)throw Error('इस device पर अधिकतम 100 निजी अवसर रखें।');const event=normalize({...value,id:crypto.randomUUID(),personal:true,source:''});list.push(event);localStorage.setItem(key,JSON.stringify(list));return event;}
function remove(id){localStorage.setItem(key,JSON.stringify(personal().filter(e=>e.id!==id)));}
window.APANAM_CALENDAR={ready,events,posters,add,remove,personal,validDate};})();
