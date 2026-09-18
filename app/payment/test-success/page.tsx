import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
export default async function TestSuccess({searchParams}:{searchParams:Promise<{session_id?:string}>}){const session=await auth();if(!session?.user)redirect("/login");const {session_id}=await searchParams;return <main className="payment-page"><section><p className="eyebrow">STRIPE SANDBOX TEST</p><h1>Test checkout complete.</h1><p>Yeh sirf test payment hai. Koi real paisa charge nahi hua aur koi bank payout nahi hoga.</p>{session_id&&<small>Test session recorded.</small>}<Link className="button" href="/studio">Back to Creator Studio</Link></section></main>}
