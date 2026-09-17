"use client";
import { useState } from "react";

type Product = { id: string; icon: string; name: string; credits: string; note: string; price: string };
type Plan = { id: string; name: string; price: string; credits: string; highlight?: boolean };
const styles = ["Traditional Indian", "Cartoon", "Festival", "Movie poster", "Instagram post"];
const languages = ["Hindi", "English", "Hinglish", "Bengali", "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Gujarati", "Punjabi", "Urdu", "Odia"];
const products: Product[] = [
  { id: "poster", icon: "✦", name: "Basic AI poster", credits: "1 credit", note: "Simple social aur film poster", price: "₹15" },
  { id: "political", icon: "◈", name: "Political poster", credits: "2 credits", note: "Neutral civic information only", price: "₹35" },
  { id: "festival", icon: "✺", name: "Festival / personal poster", credits: "2 credits", note: "Birthday, festival aur personalized", price: "₹25" },
  { id: "manual", icon: "✎", name: "Manual custom design", credits: "Custom quote", note: "Designer-assisted custom request", price: "₹99+" },
  { id: "voice", icon: "🎙️", name: "Hindi voice-over", credits: "2 credits", note: "Narration concept", price: "Coming soon" },
  { id: "cartoon", icon: "🎬", name: "Cartoon short video", credits: "12 credits", note: "Premium short video", price: "Coming soon" },
  { id: "serial", icon: "▣", name: "Serial episode", credits: "40 credits", note: "Premium story package", price: "Coming soon" },
  { id: "film", icon: "★", name: "Long film", credits: "Custom quote", note: "Duration ke hisaab se", price: "Custom" },
];
const templates = [
  { name: "Ganesh Chaturthi", idea: "Ganesh Chaturthi ki hardik shubhkamnayein, traditional Indian decoration aur festive mood", style: "Traditional Indian", language: "Hindi" },
  { name: "Diwali offer", idea: "Diwali special shop offer, bright diyas, rangoli aur family festival mood", style: "Festival", language: "Hindi" },
  { name: "Birthday wish", idea: "Happy Birthday celebration, colorful balloons, cake aur joyful friends", style: "Cartoon", language: "English" },
  { name: "Shop opening", idea: "Nayi dukaan ka grand opening, local business welcome message aur festive decoration", style: "Instagram post", language: "Hindi" },
  { name: "Movie idea", idea: "Ek chhote shehar ke hero ki inspiring journey aur cinematic dramatic scene", style: "Movie poster", language: "Hindi" },
];
const plans: Plan[] = [
  { id: "basic", name: "Basic", price: "₹199", credits: "20 credits / month" },
  { id: "creator", name: "Creator", price: "₹499", credits: "60 credits / month", highlight: true },
  { id: "studio", name: "Studio", price: "₹999", credits: "140 credits / month" },
];

type CreatorProps = { profile: { plan: string; credits: number; trialStartedAt: string | null; history: Array<{ type: string; language: string; prompt: string; createdAt: string }> } };
export default function Creator({ profile }: CreatorProps) {
  const [idea, setIdea] = useState(""); const [brief, setBrief] = useState(""); const [selected, setSelected] = useState(products[0]); const [plan, setPlan] = useState(plans[1]); const [language, setLanguage] = useState("Hindi"); const [style, setStyle] = useState(styles[0]); const [history, setHistory] = useState<string[]>(profile.history.map((item) => `${item.type} · ${item.language} · ${item.prompt.slice(0, 42)}`)); const [message, setMessage] = useState("Apna creation option select kijiye."); const [image, setImage] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const createBrief = async () => { if (!idea.trim()) { setMessage("Pehle apna story idea likhiye."); return; } setLoading(true); try { const response = await fetch("/api/creative-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ idea, language, type: selected.name }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setBrief(data.text); setHistory((items) => [`${selected.name} brief · ${language}`, ...items].slice(0, 3)); setMessage("Creative brief ready hai."); } catch (error) { setMessage(error instanceof Error ? error.message : "Writing assistant unavailable."); } finally { setLoading(false); } };
  const generate = async () => {
    if (!idea.trim()) { setMessage("Pehle apna story idea likhiye."); return; }
    if (selected.id !== "poster") { setMessage(`${selected.name} ke liye AI rendering jaldi aa rahi hai. Abhi Poster select karke real image banaiye.`); return; }
    setLoading(true); setImage(null); setMessage("Aapka poster ban raha hai…");
    try { const response = await fetch("/api/generate-poster", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: idea, language }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setImage(data.image); setHistory((items) => [`${selected.name} · ${style} · ${language}`, ...items].slice(0, 3)); setMessage("Poster ready hai. Download karke share kijiye."); } catch (error) { setMessage(error instanceof Error ? error.message : "Poster generate nahi hua."); } finally { setLoading(false); }
  };
  const applyTemplate = (template: typeof templates[number]) => { setIdea(template.idea); setStyle(template.style); setLanguage(template.language); setBrief(""); setMessage(`${template.name} template ready hai. Free brief banaiye.`); };
  return <>
    <section className="template-section"><div className="picker-heading"><div><p className="eyebrow">FREE STARTER TEMPLATES</p><h2>Ek click se shuru karein.</h2></div><p>Template choose kijiye, phir free creative brief banaiye. Koi payment ya image charge nahi.</p></div><div className="template-grid">{templates.map((template) => <button type="button" key={template.name} onClick={() => applyTemplate(template)}><b>{template.name}</b><span>{template.style} · {template.language}</span><small>Use template →</small></button>)}</div></section>
    <section className="registration-banner"><div><b>₹10 one-time registration</b><span>Account activation fee. Free trial mein sirf creative briefs milenge; image posters paid hain.</span></div><button type="button" onClick={() => setMessage("₹10 registration checkout Stripe approval ke baad live hoga.")}>Register for ₹10</button></section>
    <section className="trial-banner"><b>3 din bilkul free</b><span>Trial balance: {profile.credits} credits. Koi monthly charge nahi. Day 4 se selected plan.</span></section>
    <section className="plans" aria-label="Monthly plans"><div className="picker-heading"><div><p className="eyebrow">SIMPLE MONTHLY PLANS</p><h2>Aam creator ke budget mein.</h2></div><p>Plan kabhi bhi cancel kar sakte hain. Video aur serial premium credits se.</p></div><div className="plan-grid">{plans.map(item => <button type="button" key={item.id} onClick={() => setPlan(item)} className={`plan-card ${plan.id === item.id ? "selected" : ""} ${item.highlight ? "recommended" : ""}`}>{item.highlight && <span className="popular">Most popular</span>}<strong>{item.name}</strong><b>{item.price}<small>/month</small></b><em>{item.credits}</em><span>3-day free trial included</span></button>)}</div></section>
    <p className="language-note">Available in Hindi, English, Hinglish, Bengali, Marathi, Tamil, Telugu, Kannada, Malayalam, Gujarati, Punjabi, Urdu and Odia.</p>
    <section className="price-picker" aria-label="Creation options"><div className="picker-heading"><div><p className="eyebrow">USE YOUR CREDITS</p><h2>Jo chahiye, wahi banaiye.</h2></div><p>Basic poster ₹15, festival/personal ₹25, political ₹35 aur manual custom design ₹99+.</p></div><div className="product-grid">{products.map(product => <button type="button" key={product.id} onClick={() => setSelected(product)} className={`product-card ${selected.id === product.id ? "selected" : ""}`}><span className="product-icon">{product.icon}</span><strong>{product.name}</strong><small>{product.note}</small><b>{product.price}</b><em>{product.credits}</em></button>)}</div></section>
    <div className="creator"><div><label>YOUR STORY IDEA</label><textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Ek chhote shehar ki ladki apne cartoon hero ke saath duniya bachati hai…"/><div className="fields"><div className="selected-service"><span>{selected.icon}</span><b>{selected.name}</b><small>{selected.credits}</small></div><select value={style} onChange={e=>setStyle(e.target.value)} aria-label="Poster style">{styles.map(item => <option key={item}>{item}</option>)}</select><select value={language} onChange={e=>setLanguage(e.target.value)} aria-label="Creation language">{languages.map(item => <option key={item}>{item}</option>)}</select></div><div className="action-row"><button type="button" className="button" disabled={loading} onClick={createBrief}>{loading ? "Likha ja raha hai…" : "Create free brief →"}</button><button type="button" className="secondary-button" disabled>Poster coming soon</button></div><small>AI rendering aur checkout temporarily paused hain. Koi credit ya charge nahi lagega.</small></div><aside><p className="eyebrow">YOUR PLAN SUMMARY</p><div className="spark">{image ? <img src={image} alt="Generated poster" /> : selected.icon}</div><h2>{plan.name} plan</h2><div className="total"><span>Monthly plan after trial</span><b>{plan.price}/month</b><span>Monthly balance</span><b>{plan.credits}</b><span>Poster / service price</span><b>{selected.price}</b><span>Credits / service level</span><b>{selected.credits}</b></div><p>{message}</p>{brief && <pre className="brief">{brief}</pre>}<div className="history"><b>Recent creations</b>{history.length ? history.map((item) => <span key={item}>{item}</span>) : <span>Abhi koi creation nahi hai.</span>}</div>{image && <a className="download" href={image} download="toonsutra-poster.png">Download poster</a>}<button className="outline" type="button" onClick={() => setMessage("Checkout Stripe sandbox se live account par move hone ke baad activate hoga.")}>₹10 registration · Checkout coming soon</button></aside></div>
  </>;
}
