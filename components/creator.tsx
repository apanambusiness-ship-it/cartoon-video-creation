"use client";
import { useState } from "react";

type Product = { id: string; icon: string; name: string; unit: string; monthly: string; note: string };
const languages = ["Hindi", "English", "Hinglish", "Bengali", "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Gujarati", "Punjabi", "Urdu", "Odia"];

const products: Product[] = [
  { id: "poster", icon: "✦", name: "Poster", unit: "₹5 / credit", monthly: "₹135 / month", note: "Social aur film poster" },
  { id: "political", icon: "◈", name: "Political poster", unit: "₹10 / credit", monthly: "₹250 / month", note: "Campaign creative concept" },
  { id: "cartoon", icon: "🎬", name: "Cartoon short video", unit: "₹25 / credit", monthly: "₹500 / month", note: "Short animated story" },
  { id: "voice", icon: "🎙️", name: "Hindi voice-over", unit: "₹10 / credit", monthly: "₹250 / month", note: "Hindi narration concept" },
  { id: "serial", icon: "▣", name: "Serial episode", unit: "₹99 / credit", monthly: "₹2,500 / month", note: "Episode story package" },
  { id: "film", icon: "★", name: "Long film", unit: "₹299+ / credit", monthly: "Custom pricing", note: "Duration ke hisaab se quote" },
];

export default function Creator() {
  const [idea, setIdea] = useState("");
  const [selected, setSelected] = useState(products[0]);
  const [language, setLanguage] = useState("Hindi");
  const [message, setMessage] = useState("Apna creation option select kijiye.");
  const generate = () => setMessage(idea.trim() ? `${selected.name} concept ready: ${idea.trim()}` : "Pehle apna story idea likhiye.");
  return <>
    <section className="registration-banner"><div><b>₹5 one-time registration</b><span>Creator account activate karne ke liye. Uske baad 7 din ka free trial.</span></div><button type="button" onClick={() => setMessage("₹5 registration checkout Stripe approval ke baad live hoga.")}>Register for ₹5</button></section><section className="trial-banner"><b>7 din bilkul free</b><span>Trial ke dauran koi monthly charge nahi hoga. 8वें दिन से selected monthly plan लागू hoga.</span></section>
    <p className="language-note">Available in Hindi, English, Hinglish, Bengali, Marathi, Tamil, Telugu, Kannada, Malayalam, Gujarati, Punjabi, Urdu and Odia.</p><section className="price-picker" aria-label="Creation options"><div className="picker-heading"><div><p className="eyebrow">CHOOSE YOUR CREATION</p><h2>Jo chahiye, wahi pay karein.</h2></div><p>Har option ka alag credit price aur monthly plan hai.</p></div><div className="product-grid">{products.map(product => <button type="button" key={product.id} onClick={() => setSelected(product)} className={`product-card ${selected.id === product.id ? "selected" : ""}`}><span className="product-icon">{product.icon}</span><strong>{product.name}</strong><small>{product.note}</small><b>{product.unit}</b><em>{product.monthly}</em></button>)}</div></section>
    <div className="creator"><div><label>YOUR STORY IDEA</label><textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Ek chhote shehar ki ladki apne cartoon hero ke saath duniya bachati hai…"/><div className="fields"><div className="selected-service"><span>{selected.icon}</span><b>{selected.name}</b><small>{selected.unit}</small></div><select value={language} onChange={e=>setLanguage(e.target.value)} aria-label="Creation language">{languages.map(item => <option key={item}>{item}</option>)}</select></div><button type="button" className="button" onClick={generate}>Generate concept →</button><small>Demo mode: AI rendering aur checkout abhi live nahi hain.</small></div><aside><p className="eyebrow">YOUR PLAN SUMMARY</p><div className="spark">{selected.icon}</div><h2>{selected.name}</h2><div className="total"><span>Pay per creation</span><b>{selected.unit}</b><span>Monthly plan after 7 days</span><b>{selected.monthly}</b></div><p>{message}</p><button className="outline" type="button" onClick={() => setMessage("₹5 registration checkout Stripe approval ke baad live hoga.")}>₹5 registration · Payment soon</button></aside></div>
  </>;
}
