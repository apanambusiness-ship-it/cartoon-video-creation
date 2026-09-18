import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { neon } from "@neondatabase/serverless";
const adminEmail = "apanambusiness@gmail.com";
const statuses = ["requested", "in_progress", "ready", "delivered"] as const;
export async function PATCH(request: Request) {
  const session = await auth();
  if (session?.user?.email !== adminEmail) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const outputUrl = typeof body?.outputUrl === "string" ? body.outputUrl.trim().slice(0, 1000) : "";
  if (outputUrl && !/^https:\/\//.test(outputUrl)) return NextResponse.json({ error: "Use an https design URL." }, { status: 400 });
  const status = typeof body?.status === "string" && statuses.includes(body.status as typeof statuses[number]) ? body.status : "";
  if (!id || !status) return NextResponse.json({ error: "Invalid request update." }, { status: 400 });
  const sql = neon(process.env.DATABASE_URL);
  await sql`update creations set status = ${status}, output_url = ${outputUrl || null} where id = ${id} and type = 'Manual custom design'`;
  return NextResponse.json({ ok: true });
}
