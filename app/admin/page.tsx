import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminControls from "@/components/admin-controls";
import { getFeatures } from "@/lib/features";
import { neon } from "@neondatabase/serverless";
import { AdminRequestStatus } from "@/components/request-status";
const adminEmail = "apanambusiness@gmail.com";
export default async function Admin(){const session=await auth();if(session?.user?.email!==adminEmail)redirect("/studio");const features=await getFeatures(); const requests=process.env.DATABASE_URL ? await neon(process.env.DATABASE_URL)`select id, status, language, prompt, created_at from creations where type = 'Manual custom design' order by created_at desc limit 20` : []; return <main><header><a href="/studio" className="brand"><span>T</span>ToonSutra <i>AI</i></a><a href="/studio" className="text-button">Creator studio</a></header><section className="admin"><p className="eyebrow">TOONSUTRA ADMIN</p><h1>Control center</h1><p>Free aur paid tools ko yahan se manage kijiye.</p><AdminControls initial={features}/><AdminRequestStatus initial={requests.map((item) => ({ id: String(item.id), status: String(item.status), language: String(item.language), prompt: String(item.prompt), createdAt: String(item.created_at) }))}/></section></main>}
