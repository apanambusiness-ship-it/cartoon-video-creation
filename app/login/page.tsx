"use client";
import { signIn } from "next-auth/react";

const productionHost = "toonsutra.apanam.online";
export default function Login() {
  const isPreview = typeof window !== "undefined" && window.location.host !== productionHost;
  function continueWithGoogle() {
    if (isPreview) { window.location.href = `https://${productionHost}/login`; return; }
    signIn("google", { callbackUrl: "/studio" });
  }
  return <main className="center"><div className="card"><a className="brand" href="/">ToonSutra <i>AI</i></a><h1>Welcome, creator.</h1><p>{isPreview ? "Preview login stable custom domain par hota hai." : "Apni stories ko screen par laane ke liye sign in kijiye."}</p><button className="google" onClick={continueWithGoogle}>{isPreview ? "Open ToonSutra to sign in" : "Continue with Google"}</button><small>Sign in se aap ToonSutra AI ki terms aur privacy policy se sahmat hote hain.</small></div></main>;
}
