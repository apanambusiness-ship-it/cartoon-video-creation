import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminControls from "@/components/admin-controls";
const adminEmail = "apanambusiness@gmail.com";
export default async function Admin(){const session=await auth();if(session?.user?.email!==adminEmail)redirect("/studio");return <main><header><a href="/studio" className="brand"><span>T</span>ToonSutra <i>AI</i></a><a href="/studio" className="text-button">Creator studio</a></header><section className="admin"><p className="eyebrow">TOONSUTRA ADMIN</p><h1>Control center</h1><p>Free tools aur paid AI tools ko yahan manage karne ke liye setup ready hai.</p><AdminControls/></section></main>}
