import "server-only";
import { neon } from "@neondatabase/serverless";

export const featureKeys = ["creative_brief", "poster_generation", "video_generation", "registration_checkout", "plan_checkout"] as const;
export type FeatureKey = typeof featureKeys[number];

export async function getFeatures(): Promise<Record<FeatureKey, boolean>> {
  const defaults = Object.fromEntries(featureKeys.map((key) => [key, key === "creative_brief"])) as Record<FeatureKey, boolean>;
  if (!process.env.DATABASE_URL) return defaults;
  const sql = neon(process.env.DATABASE_URL);
  const rows = await sql`select feature_key, enabled from feature_controls`;
  for (const row of rows) {
    if (featureKeys.includes(row.feature_key as FeatureKey)) defaults[row.feature_key as FeatureKey] = Boolean(row.enabled);
  }
  return defaults;
}
