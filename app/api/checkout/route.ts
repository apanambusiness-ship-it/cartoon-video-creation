import "server-only";
import Stripe from "stripe";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { neon } from "@neondatabase/serverless";

const products = {
  registration: { name: "ToonSutra registration", description: "One-time test registration", amount: 1000, mode: "payment" },
  basic: { name: "ToonSutra Basic", description: "20 credits per month — test subscription", amount: 19900, mode: "subscription" },
  creator: { name: "ToonSutra Creator", description: "60 credits per month — test subscription", amount: 49900, mode: "subscription" },
  studio: { name: "ToonSutra Studio", description: "140 credits per month — test subscription", amount: 99900, mode: "subscription" },
} as const;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")) return NextResponse.json({ error: "Stripe test sandbox is not configured yet." }, { status: 503 });
  const body = await request.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId : "";
  if (!(productId in products)) return NextResponse.json({ error: "Invalid test product." }, { status: 400 });
  const product = products[productId as keyof typeof products];
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const url = new URL(request.url);
  const sessionData = await stripe.checkout.sessions.create({
    mode: product.mode,
    customer_email: session.user.email,
    line_items: [{ price_data: { currency: "inr", product_data: { name: product.name, description: product.description }, unit_amount: product.amount, recurring: product.mode === "subscription" ? { interval: "month" } : undefined }, quantity: 1 }],
    success_url: `${url.origin}/payment/test-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url.origin}/payment/test-cancelled`,
    metadata: { test_mode: "true", toonsutra_product: productId },
  });
  if (process.env.DATABASE_URL) { const sql = neon(process.env.DATABASE_URL); await sql`insert into payments(creator_email, stripe_session_id, amount_paise, status) values (${session.user.email}, ${sessionData.id}, ${product.amount}, 'test_pending') on conflict (stripe_session_id) do nothing`; }
  if (!sessionData.url) return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
  return NextResponse.json({ url: sessionData.url });
}
