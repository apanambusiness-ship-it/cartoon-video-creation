import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/auth";

const blockedTerms = /(?:vote\s+for|election\s+campaign|misleading|deepfake|impersonat)/i;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const language = typeof body?.language === "string" ? body.language.trim() : "Hindi";
  if (!prompt || prompt.length > 500) return NextResponse.json({ error: "Write a poster idea between 1 and 500 characters." }, { status: 400 });
  if (blockedTerms.test(prompt)) return NextResponse.json({ error: "Political persuasion, impersonation, and misleading content are not supported. Use a neutral, factual civic-information prompt." }, { status: 400 });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "Image generation is not configured yet." }, { status: 503 });

  try {
    const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash-exp", generationConfig: {
      // @ts-expect-error Gemini image modality is supported by the API but absent from this SDK type.
      responseModalities: ["Text", "Image"],
    } });
    const result = await model.generateContent(`Create one original, family-safe, text-free poster illustration. Language context: ${language}. Idea: ${prompt}`);
    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    const image = parts.find((part) => part.inlineData?.data)?.inlineData;
    if (!image?.data) return NextResponse.json({ error: "The model returned no image. Please try a simpler idea." }, { status: 502 });
    return NextResponse.json({ image: `data:${image.mimeType ?? "image/png"};base64,${image.data}` });
  } catch (error) {
    const providerError = error as { status?: number; message?: string };
    const status = providerError.status ?? 502;
    const category = status === 401 || status === 403 ? "API key or model access was denied" : status === 429 ? "API quota is temporarily exhausted" : "Gemini image generation is unavailable";
    console.error("Gemini poster generation failed", { status, category });
    return NextResponse.json({ error: `${category}. Please try again later.` }, { status: status >= 400 && status < 600 ? status : 502 });
  }
}
