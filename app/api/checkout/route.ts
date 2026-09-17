import { NextResponse } from "next/server";
import { auth } from "@/auth";
export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  return NextResponse.json({ error: "Checkout is not active yet. Stripe is in sandbox mode, so no payment can be collected." }, { status: 503 });
}
