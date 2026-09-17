import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Requests are temporarily unavailable." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const language = typeof body?.language === "string" ? body.language.trim() : "Hindi";
  if (!prompt || prompt.length > 800) return NextResponse.json({ error: "Write your design request in 1 to 800 characters." }, { status: 400 });
  const sql = neon(process.env.DATABASE_URL);
  await sql`insert into creator_profiles(email, trial_started_at) values (${session.user.email}, now()) on conflict (email) do nothing`;
  await sql`insert into creations(creator_email, type, language, prompt, status, credit_cost) values (${session.user.email}, 'Manual custom design', ${language}, ${prompt}, 'requested', 0)`;
  return NextResponse.json({ ok: true });
}
