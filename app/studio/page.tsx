import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Creator from "@/components/creator";
export default async function Studio() { const session = await auth(); if (!session?.user) redirect("/login"); return <main><header><a href="/" className="brand">ToonSutra <i>AI</i></a><form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="text-button">Sign out</button></form></header><section className="studio"><p className="eyebrow">CREATOR STUDIO</p><h1>Namaste, {session.user.name?.split(" ")[0] ?? "Creator"}.</h1><p>Apna next story concept banaiye.</p><Creator /></section></main> }
