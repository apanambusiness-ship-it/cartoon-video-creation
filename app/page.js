'use client';
import {useState} from 'react';
import {LayoutDashboard,Image,Video,Sparkles,FolderOpen,Crown,Download,Plus,Type,Palette,Upload,Undo2,Redo2} from 'lucide-react';

const tools=[['Dashboard',LayoutDashboard],['Poster Maker',Image],['Video Studio',Video],['AI Creator',Sparkles],['My Designs',FolderOpen]];
export default function Home(){
 const [title,setTitle]=useState('BIG SALE'); const [subtitle,setSubtitle]=useState('Up to 50% OFF'); const [active,setActive]=useState('Poster Maker'); const [bg,setBg]=useState('#5b21b6');
 return <main className="shell">
  <aside><div className="brand"><div className="mark">A</div><div><b>APANAM</b><small>AI Creative Studio</small></div></div><nav>{tools.map(([n,I])=><button key={n} onClick={()=>setActive(n)} className={active===n?'active':''}><I size={19}/>{n}{(n==='Video Studio'||n==='AI Creator')&&<span className="soon">Soon</span>}</button>)}</nav><div className="upgrade"><Crown/><b>Start Free</b><p>Create first. Upgrade only when your business grows.</p><button>Free Plan</button></div></aside>
  <section className="workspace"><header><div><h1>{active}</h1><p>Create professional content for your business.</p></div><div className="headBtns"><button><FolderOpen size={18}/> My Designs</button><button className="primary"><Plus size={18}/> New Design</button></div></header>
  {active==='Poster Maker'?<div className="editor"><section className="panel"><h3>Poster Content</h3><label>Headline<input value={title} onChange={e=>setTitle(e.target.value)}/></label><label>Offer / subtitle<input value={subtitle} onChange={e=>setSubtitle(e.target.value)}/></label><h3>Background</h3><div className="colors">{['#5b21b6','#be123c','#0369a1','#047857','#111827','#ea580c'].map(c=><button aria-label={c} onClick={()=>setBg(c)} style={{background:c}} key={c}/>)}</div><button className="wide"><Upload size={17}/> Upload product image</button><p className="hint">Free version starts with manual creation. Paid AI APIs are not required.</p></section>
  <section className="canvasArea"><div className="toolbar"><button><Undo2 size={17}/></button><button><Redo2 size={17}/></button><span></span><button><Type size={17}/> Text</button><button><Palette size={17}/> Style</button></div><div className="poster" style={{background:`linear-gradient(145deg,${bg},#111827)`}}><div className="badge">APANAM</div><div className="posterText"><small>LIMITED TIME OFFER</small><h2>{title}</h2><p>{subtitle}</p><button>SHOP NOW</button></div><div className="circle">50%<small>OFF</small></div></div><div className="canvasBottom"><span>1080 × 1080 • Instagram Post</span><button className="primary"><Download size={17}/> Download</button></div></section></div>:<Coming name={active}/>} 
  </section>
 </main>
}
function Coming({name}){return <div className="coming"><Sparkles size={42}/><h2>{name}</h2><p>This module is planned for the next build. We are keeping the first version lightweight and free to operate.</p>{name==='Dashboard'&&<div className="stats"><div><b>0</b><span>Designs</span></div><div><b>Free</b><span>Current plan</span></div><div><b>₹0</b><span>AI API cost</span></div></div>}</div>}
