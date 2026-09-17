"use client";
import { useState } from "react";
const tools = [
  ["Free creative brief", "On", "Free Gemini text assistant: captions, scripts and ideas."],
  ["AI poster generation", "Off", "Enable only after Gemini billing and spend cap are verified."],
  ["AI video generation", "Off", "Keep off until a per-video price and provider budget are approved."],
  ["₹10 registration checkout", "Off", "Enable only after Stripe moves from sandbox to a live account."],
  ["Monthly plan checkout", "Off", "Requires Stripe webhooks and persistent credits in Neon."],
];
export default function AdminControls(){const [status,setStatus]=useState<Record<string,boolean>>({});return <section className="admin-controls"><p className="eyebrow">ADMIN CONTROLS</p><h2>Tool availability</h2><p>Only your admin account can access this page. Changes are preview-only until the Neon schema is applied.</p>{tools.map(([name,defaultStatus,detail])=>{const enabled=status[name] ?? defaultStatus === "On";return <article key={name}><div><b>{name}</b><span>{detail}</span></div><button type="button" className={enabled?"on":"off"} onClick={()=>setStatus(s=>({...s,[name]:!enabled}))}>{enabled?"Enabled":"Paused"}</button></article>})}<div className="admin-note"><b>Before enabling paid tools</b><span>Apply `db/schema.sql` in Neon, verify Gemini billing/spend limits, connect live Stripe, then enable server-side persistence for these switches.</span></div></section>}
