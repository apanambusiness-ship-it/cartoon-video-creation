"use client";
import { useState } from "react";

type Product = { id: string; icon: string; name: string; credits: string; note: string };
type Plan = { id: string; name: string; price: string; credits: string; highlight?: boolean };
const languages = ["Hindi", "English", "Hinglish", "Bengali", "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Gujarati", "Punjabi", "Urdu", "Odia"];
const products: Product[] = [
  { id: "poster", icon: "✦", name: "Poster", credits: "1 credit", note: "Social aur film poster" },
  { id: "political", icon: "◈", name: "Political poster", credits: "2 credits", note: "Campaign creative concept" },
  { id: "voice", icon: "🎙️", name: "Hindi voice-over", credits: "2 credits", note: "Narration concept" },
  { id: "cartoon", icon: "🎬", name: "Cartoon short video", credits: "12 credits", note: "Premium short video" },
  { id: "serial", icon: "▣", name: "Serial episode", credits: "40 credits", note: "Premium story package" },
  { id: "film", icon: "★", name: "Long film", credits: "Custom quote", note: "Duration ke hisaab se" },
];
const plans: Plan[] = [
  { id: "basic", name: "Basic", price: "₹199", credits: "20 credits / month" },
  { id: "creator", name: "Creator", price: "₹499", credits: "60 credits / month", highlight: true },
  { id: "studio", name: "Studio", price: "₹999", credits: "140 credits / month" },
];

export default function Creator() {
  const [idea, setIdea] = useState(""); const [selected, setSelected] = useState(products[0]); const [plan, setPlan] = useState(plans[1]); const [language, setLanguage] = useState("Hindi"); const [message, setMessage] = useState("Apna creation option select kijiye."); const [image, setImage] = useState<string | null>(null); const [loading, setLoading] = useState(false);
  const generate = async () => {
    if (!idea.trim()) { setMessage("Pehle apna story idea likhiye."); return; }
    if (selected.id !== "poster") { setMessage(`${selected.name} ke liye AI rendering jaldi aa rahi hai. Abhi Poster select karke real image banaiye.`); return; }
    setLoading(true); setImage(null); setMessage("Aapka poster ban raha hai…");
    try { const response = await fetch("/api/generate-poster", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: idea, language }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setImage(data.image); setMessage("Poster ready hai. Download karke share kijiye."); } catch (error) { setMessage(error instanceof Error ? error.message : "Poster generate nahi hua."); } finally { setLoading(false); }
  };
  return <>
    <section className="registration-banner"><div><b>₹10 one-time registration</b><span>Creator account activate kijiye. Uske baad 3 din ka free trial.</span></div><button type="button" onClick={() => setMessage("₹10 registration checkout Stripe approval ke baad live hoga.")}>Register for ₹10</button></section>
    <section className="trial-banner"><b>3 din bilkul free</b><span>Trial mein 3 poster credits. Koi monthly charge nahi. Day 4 se selected plan.</span></section>
    <section className="plans" aria-label="Monthly plans"><div className="picker-heading"><div><p className="eyebrow">SIMPLE MONTHLY PLANS</p><h2>Aam creator ke budget mein.</h2></div><p>Plan kabhi bhi cancel kar sakte hain. Video aur serial premium credits se.</p></div><div className="plan-grid">{plans.map(item => <button type="button" key={item.id} onClick={() => setPlan(item)} className={`plan-card ${plan.id === item.id ? "selected" : ""} ${item.highlight ? "recommended" : ""}`}>{item.highlight && <span className="popular">Most popular</span>}<strong>{item.name}</strong><b>{item.price}<small>/month</small></b><em>{item.credits}</em><span>3-day free trial included</span></button>)}</div></section>
    <p className="language-note">Available in Hindi, English, Hinglish, Bengali, Marathi, Tamil, Telugu, Kannada, Malayalam, Gujarati, Punjabi, Urdu and Odia.</p>
    <section className="price-picker" aria-label="Creation options"><div className="picker-heading"><div><p className="eyebrow">USE YOUR CREDITS</p><h2>Jo chahiye, wahi banaiye.</h2></div><p>Poster aur voice-over low-cost. Video, serial aur film premium services hain.</p></div><div className="product-grid">{products.map(product => <button type="button" key={product.id} onClick={() => setSelected(product)} className={`product-card ${selected.id === product.id ? "selected" : ""}`}><span className="product-icon">{product.icon}</span><strong>{product.name}</strong><small>{product.note}</small><b>{product.credits}</b></button>)}</div></section>
    <div className="creator"><div><label>YOUR STORY IDEA</label><textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Ek chhote shehar ki ladki apne cartoon hero ke saath duniya bachati hai…"/><div className="fields"><div className="selected-service"><span>{selected.icon}</span><b>{selected.name}</b><small>{selected.credits}</small></div><select value={language} onChange={e=>setLanguage(e.target.value)} aria-label="Creation language">{languages.map(item => <option key={item}>{item}</option>)}</select></div><button type="button" className="button" disabled={loading} onClick={generate}>{loading ? "Poster ban raha hai…" : selected.id === "poster" ? "Generate poster →" : "Generate concept →"}</button><small>Poster generation live hai. Other AI services aur checkout abhi live nahi hain.</small></div><aside><p className="eyebrow">YOUR PLAN SUMMARY</p><div className="spark">{image ? <img src={image} alt="Generated poster" /> : selected.icon}</div><h2>{plan.name} plan</h2><div className="total"><span>Monthly plan after trial</span><b>{plan.price}/month</b><span>Monthly balance</span><b>{plan.credits}</b><span>This creation needs</span><b>{selected.credits}</b></div><p>{message}</p>{image && <a className="download" href={image} download="toonsutra-poster.png">Download poster</a>}<button className="outline" type="button" onClick={() => setMessage("₹10 registration aur plan checkout Stripe approval ke baad live hoga.")}>₹10 registration · Payment soon</button></aside></div>
  </>;
}
