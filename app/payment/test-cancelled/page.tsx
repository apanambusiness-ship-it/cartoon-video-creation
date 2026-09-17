import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
export default async function TestCancelled(){const session=await auth();if(!session?.user)redirect("/login");return <main className="payment-page"><section><p className="eyebrow">STRIPE SANDBOX TEST</p><h1>Test checkout cancelled.</h1><p>Koi payment nahi hua. Aap jab chahein test checkout dobara khol sakte hain.</p><Link className="button" href="/studio">Back to Creator Studio</Link></section></main>}
