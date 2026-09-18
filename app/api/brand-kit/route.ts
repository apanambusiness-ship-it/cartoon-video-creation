import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Brand Kit is temporarily unavailable." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const brandName = typeof body?.brandName === "string" ? body.brandName.trim().slice(0, 80) : "";
  const tagline = typeof body?.tagline === "string" ? body.tagline.trim().slice(0, 140) : "";
  const primaryColor = typeof body?.primaryColor === "string" && /^#[0-9a-fA-F]{6}$/.test(body.primaryColor) ? body.primaryColor : "#634bc8";
  const accentColor = typeof body?.accentColor === "string" && /^#[0-9a-fA-F]{6}$/.test(body.accentColor) ? body.accentColor : "#ee6040";
  const sql = neon(process.env.DATABASE_URL);
  await sql`insert into creator_profiles(email, trial_started_at) values (${session.user.email}, now()) on conflict (email) do nothing`;
  await sql`insert into brand_kits(creator_email, brand_name, tagline, primary_color, accent_color) values (${session.user.email}, ${brandName}, ${tagline}, ${primaryColor}, ${accentColor}) on conflict (creator_email) do update set brand_name = excluded.brand_name, tagline = excluded.tagline, primary_color = excluded.primary_color, accent_color = excluded.accent_color, updated_at = now()`;
  return NextResponse.json({ ok: true });
}
