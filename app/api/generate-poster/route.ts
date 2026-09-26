import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  return NextResponse.json({ error: "Poster generation is paused while Gemini billing is being configured. No credits or charges were used." }, { status: 503 });
}
