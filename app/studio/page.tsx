import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Creator from "@/components/creator";
import { getCreatorProfile } from "@/lib/creator-data";
export default async function Studio() { const session = await auth(); if (!session?.user) redirect("/login"); const profile = await getCreatorProfile(session.user.email ?? ""); return <main><header><a href="/" className="brand">ToonSutra <i>AI</i></a><a className="text-button" href="/admin">Admin</a><form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}><button className="text-button">Sign out</button></form></header><section className="studio"><p className="eyebrow">CREATOR STUDIO</p><h1>Namaste, {session.user.name?.split(" ")[0] ?? "Creator"}.</h1><p>Apna next story concept banaiye.</p><Creator profile={profile} /></section></main> }
