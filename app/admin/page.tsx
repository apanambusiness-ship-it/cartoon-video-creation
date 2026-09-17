import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminControls from "@/components/admin-controls";
import { getFeatures } from "@/lib/features";
import { neon } from "@neondatabase/serverless";
const adminEmail = "apanambusiness@gmail.com";
export default async function Admin(){const session=await auth();if(session?.user?.email!==adminEmail)redirect("/studio");const features=await getFeatures(); const requests=process.env.DATABASE_URL ? await neon(process.env.DATABASE_URL)`select creator_email, language, prompt, created_at from creations where type = 'Manual custom design' and status = 'requested' order by created_at desc limit 20` : []; return <main><header><a href="/studio" className="brand"><span>T</span>ToonSutra <i>AI</i></a><a href="/studio" className="text-button">Creator studio</a></header><section className="admin"><p className="eyebrow">TOONSUTRA ADMIN</p><h1>Control center</h1><p>Free aur paid tools ko yahan se manage kijiye.</p><AdminControls initial={features}/><section className="request-list"><p className="eyebrow">MANUAL DESIGN REQUESTS</p><h2>New requests</h2>{requests.length ? requests.map((item,index)=><article key={`${item.created_at}-${index}`}><b>{String(item.creator_email)}</b><span>{String(item.language)} · {String(item.prompt)}</span></article>) : <p>No manual design requests yet.</p>}</section></section></main>}
