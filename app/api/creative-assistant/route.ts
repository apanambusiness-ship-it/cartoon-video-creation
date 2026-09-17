import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const idea = typeof body?.idea === "string" ? body.idea.trim() : "";
  const language = typeof body?.language === "string" ? body.language.trim() : "Hindi";
  const type = typeof body?.type === "string" ? body.type.trim() : "Poster";
  if (!idea || idea.length > 500) return NextResponse.json({ error: "Write an idea between 1 and 500 characters." }, { status: 400 });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "Writing assistant is not configured." }, { status: 503 });
  try {
    const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(`You are ToonSutra AI, a family-safe Indian creator assistant. In ${language}, write a concise creative brief for a ${type} based on: ${idea}. Include title, 2-line concept, caption, visual style, and 3 hashtags. Do not impersonate people or write political persuasion.`);
    return NextResponse.json({ text: result.response.text() });
  } catch (error) {
    const status = (error as { status?: number }).status;
    return NextResponse.json({ error: status === 429 ? "Free AI limit reached. Please try again later." : "Writing assistant is temporarily unavailable." }, { status: status === 429 ? 429 : 502 });
  }
}
