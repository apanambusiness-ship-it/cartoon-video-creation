import Link from "next/link";
import SiteFooter from "@/components/site-footer";

const creations = [
  ["🎬", "Cartoon videos", "Story se scene-by-scene animated video concept."],
  ["🎙️", "Hindi voice-over", "Hindi, Hinglish aur English storytelling support."],
  ["✦", "Posters", "Films, campaigns aur social posts ke liye visual concepts."],
];

export default function Home() {
  return <main>
    <header><Link href="/" className="brand"><span>T</span>ToonSutra <i>AI</i></Link><nav><a href="#create">Create</a><a href="#price">Pricing</a><Link className="button small" href="/login">Sign in</Link></nav></header>
    <section className="hero">
      <div><p className="eyebrow">INDIA'S AI STORY STUDIO</p><h1>Apni soch ko<br/><em>screen par laaiye.</em></h1><p>Text se cartoon videos, cinematic posters aur Hindi voice-over. Ek idea se poori kahani banaiye—bina editing seekhe.</p><div className="hero-actions"><Link className="button" href="/studio">Free mein try karein →</Link><a className="text-link" href="#how">Kaise kaam karta hai</a></div><div className="trust"><span>Hindi + English</span><span>Creator-friendly</span><span>Simple pricing</span></div></div>
      <div className="hero-art" aria-label="ToonSutra AI creative preview"><div className="sun"/><div className="poster"><small>TOONSUTRA ORIGINAL</small><b>THE<br/>LAST<br/>KITE</b><i>Animated story</i></div><div className="tag">Hindi voice ✓</div><div className="tag bottom">Scene 04 · Ready</div></div>
    </section>
    <section id="create" className="product-intro"><p className="eyebrow">CREATE WITH CONFIDENCE</p><h2>Har creator ke liye ek studio.</h2><div className="creation-grid">{creations.map(([icon,title,text]) => <article key={title}><div className="icon">{icon}</div><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section id="how" className="features"><article><b>01</b><h2>Likhiye</h2><p>Apni story, campaign ya poster ka idea Hindi ya English mein likhiye.</p></article><article><b>02</b><h2>Banaiye</h2><p>Format aur language select karke creative concept banaiye.</p></article><article><b>03</b><h2>Share kijiye</h2><p>Launch पर अपना content audience तक pahunchaiye.</p></article></section>
    <section id="price" className="pricing"><div><p className="eyebrow">MONTHLY CREDIT PLANS</p><h2>₹199 se <small>/ month</small></h2><p>₹199 Basic, ₹499 Creator aur ₹999 Studio. 3-day free trial ke saath.</p></div><div><ul><li>Monthly creation credits</li><li>Cartoon video & poster concepts</li><li>Hindi, Hinglish & English support</li><li>Creator dashboard</li></ul><Link className="button dark" href="/studio">Start creating →</Link></div></section>
    <SiteFooter/>
  </main>;
}
