"use client";
import { useState } from "react";

type Feature = { key: string; name: string; detail: string };
const tools: Feature[] = [
  { key: "creative_brief", name: "Free creative brief", detail: "Gemini text assistant: captions, scripts and ideas." },
  { key: "poster_generation", name: "AI poster generation", detail: "Enable only after Gemini billing and spend cap are verified." },
  { key: "video_generation", name: "AI video generation", detail: "Keep off until a per-video price and provider budget are approved." },
  { key: "registration_checkout", name: "₹10 registration checkout", detail: "Enable only after Stripe moves from sandbox to a live account." },
  { key: "plan_checkout", name: "Monthly plan checkout", detail: "Requires Stripe webhooks and persistent credits in Neon." },
];
export default function AdminControls({ initial }: { initial: Record<string, boolean> }) {
  const [status, setStatus] = useState(initial); const [saving, setSaving] = useState<string | null>(null); const [message, setMessage] = useState("");
  async function toggle(key: string) { const enabled = !status[key]; setSaving(key); setMessage(""); try { const response = await fetch("/api/admin/features", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, enabled }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setStatus((previous) => ({ ...previous, [key]: enabled })); setMessage("Setting saved for all users."); } catch (error) { setMessage(error instanceof Error ? error.message : "Setting could not be saved."); } finally { setSaving(null); } }
  return <section className="admin-controls"><p className="eyebrow">ADMIN CONTROLS</p><h2>Tool availability</h2><p>Only your admin account can change these settings. Paid tools are off until you activate billing.</p>{tools.map((tool) => { const enabled = Boolean(status[tool.key]); return <article key={tool.key}><div><b>{tool.name}</b><span>{tool.detail}</span></div><button type="button" className={enabled ? "on" : "off"} disabled={saving === tool.key} onClick={() => toggle(tool.key)}>{saving === tool.key ? "Saving…" : enabled ? "Enabled" : "Paused"}</button></article>})}<div className="admin-note"><b>{message || "Before enabling paid tools"}</b><span>Enable a paid tool only after its provider billing and spend limit are verified.</span></div></section>;
}
