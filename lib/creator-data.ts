import "server-only";
import { neon } from "@neondatabase/serverless";

export type CreatorProfile = { plan: string; credits: number; trialStartedAt: string | null; history: Array<{ type: string; language: string; prompt: string; createdAt: string }> };
export async function getCreatorProfile(email: string): Promise<CreatorProfile> {
  const fallback = { plan: "trial", credits: 3, trialStartedAt: null, history: [] };
  if (!process.env.DATABASE_URL) return fallback;
  const sql = neon(process.env.DATABASE_URL);
  await sql`insert into creator_profiles(email, trial_started_at) values (${email}, now()) on conflict (email) do nothing`;
  const profiles = await sql`select plan, credits, trial_started_at from creator_profiles where email = ${email}`;
  const history = await sql`select type, language, prompt, created_at from creations where creator_email = ${email} order by created_at desc limit 5`;
  const profile = profiles[0];
  return { plan: String(profile?.plan ?? "trial"), credits: Number(profile?.credits ?? 3), trialStartedAt: profile?.trial_started_at ? String(profile.trial_started_at) : null, history: history.map((item) => ({ type: String(item.type), language: String(item.language), prompt: String(item.prompt), createdAt: String(item.created_at) })) };
}
export async function saveBrief(email: string, type: string, language: string, prompt: string) {
  if (!process.env.DATABASE_URL) return;
  const sql = neon(process.env.DATABASE_URL);
  await sql`insert into creations(creator_email, type, language, prompt, status, credit_cost) values (${email}, ${type}, ${language}, ${prompt}, 'completed', 0)`;
}
