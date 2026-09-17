import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminControls from "@/components/admin-controls";
import { getFeatures } from "@/lib/features";
const adminEmail = "apanambusiness@gmail.com";
export default async function Admin(){const session=await auth();if(session?.user?.email!==adminEmail)redirect("/studio");const features=await getFeatures();return <main><header><a href="/studio" className="brand"><span>T</span>ToonSutra <i>AI</i></a><a href="/studio" className="text-button">Creator studio</a></header><section className="admin"><p className="eyebrow">TOONSUTRA ADMIN</p><h1>Control center</h1><p>Free aur paid tools ko yahan se manage kijiye.</p><AdminControls initial={features}/></section></main>}
