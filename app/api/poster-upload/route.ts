import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/auth";

const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Private media storage is not configured." }, { status: 503 });
  const form = await request.formData();
  const file = form.get("file");
  const kind = form.get("kind") === "logo" ? "logo" : "photo";
  if (!(file instanceof File) || !allowed.has(file.type) || file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Use a JPG, PNG, or WebP image up to 4 MB." }, { status: 400 });
  const safeEmail = session.user.email.replace(/[^a-zA-Z0-9]/g, "_");
  const result = await put(`posters/${safeEmail}/${kind}-${crypto.randomUUID()}`, file, { access: "private", addRandomSuffix: true });
  return NextResponse.json({ url: result.url, name: file.name });
}
