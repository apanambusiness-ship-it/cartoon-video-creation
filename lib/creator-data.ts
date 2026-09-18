import "server-only";
import { neon } from "@neondatabase/serverless";

export type CreatorProfile = { plan: string; credits: number; trialStartedAt: string | null; brand: { brandName: string; tagline: string; primaryColor: string; accentColor: string }; history: Array<{ type: string; language: string; prompt: string; createdAt: string; outputUrl?: string }>; requests: Array<{ id: string; status: string; language: string; prompt: string; createdAt: string }> };
export async function getCreatorProfile(email: string): Promise<CreatorProfile> {
  const fallback = { plan: "trial", credits: 3, trialStartedAt: null, brand: { brandName: "", tagline: "", primaryColor: "#634bc8", accentColor: "#ee6040" }, history: [], requests: [] };
  if (!process.env.DATABASE_URL) return fallback;
  const sql = neon(process.env.DATABASE_URL);
  await sql`insert into creator_profiles(email, trial_started_at) values (${email}, now()) on conflict (email) do nothing`;
  const profiles = await sql`select plan, credits, trial_started_at from creator_profiles where email = ${email}`;
  const kits = await sql`select brand_name, tagline, primary_color, accent_color from brand_kits where creator_email = ${email}`.catch(() => []);
  const history = await sql`select type, language, prompt, created_at from creations where creator_email = ${email} and status != 'requested' order by created_at desc limit 5`;
  const requests = await sql`select id, status, language, prompt, output_url, created_at from creations where creator_email = ${email} and type = 'Manual custom design' order by created_at desc limit 12`;
  const profile = profiles[0];
  const kit = kits[0];
  return { plan: String(profile?.plan ?? "trial"), credits: Number(profile?.credits ?? 3), trialStartedAt: profile?.trial_started_at ? String(profile.trial_started_at) : null, brand: { brandName: String(kit?.brand_name ?? ""), tagline: String(kit?.tagline ?? ""), primaryColor: String(kit?.primary_color ?? "#634bc8"), accentColor: String(kit?.accent_color ?? "#ee6040") }, history: history.map((item) => ({ type: String(item.type), language: String(item.language), prompt: String(item.prompt), createdAt: String(item.created_at) })), requests: requests.map((item) => ({ id: String(item.id), status: String(item.status), language: String(item.language), prompt: String(item.prompt), createdAt: String(item.created_at), outputUrl: item.output_url ? String(item.output_url) : undefined })) };
}
export async function saveBrief(email: string, type: string, language: string, prompt: string) {
  if (!process.env.DATABASE_URL) return;
  const sql = neon(process.env.DATABASE_URL);
  await sql`insert into creations(creator_email, type, language, prompt, status, credit_cost) values (${email}, ${type}, ${language}, ${prompt}, 'completed', 0)`;
}
