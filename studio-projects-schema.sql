-- Studio private poster projects. Five fixed slots bound per-user storage.
create table public.studio_projects (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 slot smallint not null check(slot between 1 and 5),
 title text not null check(length(title) between 1 and 80),
 payload jsonb not null check(coalesce(jsonb_typeof(payload),'')='object' and coalesce(jsonb_typeof(payload->'html'),'')='string' and octet_length(payload::text)<=2097152),
 version bigint not null default 1 check(version>0),
 updated_at timestamptz not null default now(),
 primary key(user_id,slot)
);
alter table public.studio_projects enable row level security;
revoke all on public.studio_projects from anon,authenticated;
grant select,insert,update on public.studio_projects to authenticated;
create policy "User reads own poster projects" on public.studio_projects for select to authenticated using(user_id=(select auth.uid()));
create policy "User creates own poster projects" on public.studio_projects for insert to authenticated with check(user_id=(select auth.uid()));
create policy "User updates own poster projects" on public.studio_projects for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
-- No hard-delete UI. Reuse slots after keeping a downloaded JSON backup.
