"use client";
import { signIn } from "next-auth/react";
export default function Login() { return <main className="center"><div className="card"><a className="brand" href="/">ToonSutra <i>AI</i></a><h1>Welcome, creator.</h1><p>Apni stories ko screen par laane ke liye sign in kijiye.</p><button className="google" onClick={() => signIn("google", { callbackUrl: "/studio" })}>Continue with Google</button><small>Sign in se aap ToonSutra AI ki terms aur privacy policy se sahmat hote hain.</small></div></main> }
