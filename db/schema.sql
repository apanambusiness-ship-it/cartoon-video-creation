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
