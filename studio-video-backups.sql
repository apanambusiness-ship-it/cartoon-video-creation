-- APANAMai Studio: private small video/audio project backups.
create schema if not exists studio_private;
revoke all on schema studio_private from public, anon, authenticated;
create table studio_private.video_budget(id boolean primary key default true check(id),used_bytes bigint not null default 0 check(used_bytes>=0),max_bytes bigint not null default 52428800 check(max_bytes>0));
insert into studio_private.video_budget(id) values(true);
revoke all on studio_private.video_budget from public,anon,authenticated;
create table public.studio_video_projects(
 user_id uuid not null references auth.users(id) on delete cascade,
 slot smallint not null check(slot between 1 and 2),
 title text not null check(char_length(title) between 1 and 80),
 payload jsonb not null check(coalesce(payload->>'format'='apanam-cartoon-project-full' and jsonb_typeof(payload->'scenes')='array' and jsonb_array_length(payload->'scenes') between 1 and 100 and octet_length(payload::text)<=2097152,false)),
 version bigint not null default 1 check(version>0),
 updated_at timestamptz not null default now(),
 primary key(user_id,slot)
);
alter table public.studio_video_projects enable row level security;
revoke all on public.studio_video_projects from public,anon,authenticated;
grant select,insert,update,delete on public.studio_video_projects to authenticated;
create policy "Read own video backups" on public.studio_video_projects for select to authenticated using(user_id=(select auth.uid()));
create policy "Create own video backups" on public.studio_video_projects for insert to authenticated with check(user_id=(select auth.uid()));
create policy "Update own video backups" on public.studio_video_projects for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "Delete own video backups" on public.studio_video_projects for delete to authenticated using(user_id=(select auth.uid()));
create function studio_private.video_budget_guard() returns trigger language plpgsql security definer set search_path='' as $$
declare delta bigint;
begin
 if tg_op='INSERT' then
  delta:=pg_catalog.octet_length(new.payload::text);new.version:=1;new.updated_at:=pg_catalog.clock_timestamp();
 elsif tg_op='UPDATE' then
  if new.user_id<>old.user_id or new.slot<>old.slot then raise exception 'Video backup identity cannot change';end if;
  delta:=pg_catalog.octet_length(new.payload::text)-pg_catalog.octet_length(old.payload::text);new.version:=old.version+1;new.updated_at:=pg_catalog.clock_timestamp();
 else delta:=-pg_catalog.octet_length(old.payload::text);
 end if;
 update studio_private.video_budget set used_bytes=used_bytes+delta where id=true and used_bytes+delta between 0 and max_bytes;
 if not found then raise exception 'Free video cloud storage is full. Keep a local JSON backup; no payment has been started.';end if;
 if tg_op='DELETE' then return old;end if;return new;
end $$;
revoke all on function studio_private.video_budget_guard() from public,anon,authenticated;
create trigger video_budget_guard before insert or update or delete on public.studio_video_projects for each row execute function studio_private.video_budget_guard();
notify pgrst,'reload schema';
