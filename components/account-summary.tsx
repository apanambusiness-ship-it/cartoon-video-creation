import type { CreatorProfile } from "@/lib/creator-data";

export default function AccountSummary({ profile }: { profile: CreatorProfile }) {
  const started = profile.trialStartedAt ? new Date(profile.trialStartedAt).getTime() : Date.now();
  const daysLeft = Math.max(0, 3 - Math.floor((Date.now() - started) / 86_400_000));
  return <section className="account-summary" aria-label="My account"><div className="account-title"><p className="eyebrow">MY ACCOUNT</p><h2>Your creator dashboard</h2></div><div className="account-grid"><article><span>Current plan</span><b>{profile.plan === "trial" ? "3-day trial" : profile.plan}</b><small>{daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining` : "Trial completed"}</small></article><article><span>Available credits</span><b>{profile.credits}</b><small>Poster credits ready</small></article><article><span>Saved briefs</span><b>{profile.history.length}</b><small>Last 5 shown below</small></article></div>{profile.history.length > 0 && <div className="account-history"><b>Recent activity</b>{profile.history.map((item, index) => <span key={`${item.createdAt}-${index}`}>{item.type} · {item.language} · {item.prompt.slice(0, 54)}</span>)}</div>}</section>;
}
