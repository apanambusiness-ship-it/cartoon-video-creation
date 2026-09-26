-- Run in the Neon SQL editor when you activate persistent billing.
create table if not exists creator_profiles (
  email text primary key,
  trial_started_at timestamptz,
  plan text not null default 'trial',
  credits integer not null default 3,
  registration_paid boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists creations (
  id uuid primary key default gen_random_uuid(),
  creator_email text not null references creator_profiles(email),
  type text not null,
  language text not null,
  prompt text not null,
  status text not null default 'draft',
  credit_cost integer not null default 0,
  output_url text,
  created_at timestamptz not null default now()
);
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  creator_email text not null references creator_profiles(email),
  stripe_session_id text unique,
  amount_paise integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists feature_controls (
  feature_key text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into feature_controls(feature_key, enabled) values
  ('creative_brief', true), ('poster_generation', false), ('video_generation', false), ('registration_checkout', false), ('plan_checkout', false)
on conflict (feature_key) do nothing;

create table if not exists brand_kits (
  creator_email text primary key references creator_profiles(email),
  brand_name text not null default '',
  tagline text not null default '',
  primary_color text not null default '#634bc8',
  accent_color text not null default '#ee6040',
  updated_at timestamptz not null default now()
);

create table if not exists poster_drafts (
  id uuid primary key default gen_random_uuid(),
  creator_email text not null references creator_profiles(email),
  title text not null default 'Untitled poster',
  layout jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists poster_drafts_creator_updated on poster_drafts(creator_email, updated_at desc);
