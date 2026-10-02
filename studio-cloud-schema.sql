-- APANAMai Studio only. Do not apply to ERP projects.
create table public.studio_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.studio_admins enable row level security;
revoke all on public.studio_admins from anon, authenticated;
grant select on public.studio_admins to authenticated;
create policy "Owner can inspect own admin grant" on public.studio_admins for select to authenticated using (user_id=(select auth.uid()));

create table public.studio_catalogs (
  id text primary key check (id in ('draft','published')),
  payload jsonb not null check (payload->>'format'='apanam-studio-catalog' and jsonb_typeof(payload->'templates')='array' and octet_length(payload::text)<=10485760),
  version bigint not null default 1 check (version>0),
  updated_at timestamptz not null default now(),
  check (id<>'published' or not jsonb_path_exists(payload,'$.templates[*] ? (@.published == false)'))
);
alter table public.studio_catalogs enable row level security;
revoke all on public.studio_catalogs from anon,authenticated;
grant select on public.studio_catalogs to anon,authenticated;
grant update on public.studio_catalogs to authenticated;
create policy "Public reads published catalog only" on public.studio_catalogs for select to anon,authenticated using (id='published');
create policy "Admin reads draft" on public.studio_catalogs for select to authenticated using (exists(select 1 from public.studio_admins where user_id=(select auth.uid())));
create policy "Admin updates existing catalogs" on public.studio_catalogs for update to authenticated using (exists(select 1 from public.studio_admins where user_id=(select auth.uid()))) with check (exists(select 1 from public.studio_admins where user_id=(select auth.uid())));

-- Images are uploaded once; drafts and public designs refer to the same asset URL.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('studio-posters','studio-posters',true,2097152,array['image/png','image/jpeg','image/webp','image/gif']);
create policy "Admin uploads poster assets" on storage.objects for insert to authenticated with check (bucket_id='studio-posters' and exists(select 1 from public.studio_admins where user_id=(select auth.uid())));
create policy "Admin reads poster assets" on storage.objects for select to authenticated using (bucket_id='studio-posters' and exists(select 1 from public.studio_admins where user_id=(select auth.uid())));
-- No client overwrite or delete: previously downloaded/saved projects keep their URLs.
