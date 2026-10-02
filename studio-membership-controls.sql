alter table public.studio_memberships add column revoked boolean not null default false;
alter table public.studio_memberships add column granted_at timestamptz not null default now();
alter table public.studio_memberships drop constraint studio_memberships_expires_at_check;
alter table public.studio_memberships add constraint studio_memberships_duration_check check(expires_at>granted_at and expires_at<=granted_at+interval '366 days');
