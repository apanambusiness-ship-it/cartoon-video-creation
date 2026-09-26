import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/auth";
import { featureKeys, type FeatureKey } from "@/lib/features";

const adminEmail = "apanambusiness@gmail.com";
export async function PATCH(request: Request) {
  const session = await auth();
  if (session?.user?.email !== adminEmail) return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const key = body?.key as FeatureKey;
  const enabled = body?.enabled;
  if (!featureKeys.includes(key) || typeof enabled !== "boolean") return NextResponse.json({ error: "Invalid feature update." }, { status: 400 });
  const sql = neon(process.env.DATABASE_URL);
  await sql`update feature_controls set enabled = ${enabled}, updated_at = now() where feature_key = ${key}`;
  return NextResponse.json({ key, enabled });
}
