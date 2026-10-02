-- Studio only: complimentary manual membership; no paid access claims.
create table public.studio_memberships (
 user_id uuid primary key references auth.users(id) on delete cascade,
 plan text not null default 'manual_complimentary' check (plan='manual_complimentary'),
 expires_at timestamptz not null,
 granted_by uuid not null default auth.uid() references auth.users(id),
 check (expires_at>now() and expires_at<=now()+interval '366 days')
);
alter table public.studio_memberships enable row level security;
revoke all on public.studio_memberships from anon,authenticated;
grant select,insert,update on public.studio_memberships to authenticated;
create policy "Member reads own manual entitlement" on public.studio_memberships for select to authenticated using (user_id=(select auth.uid()));
create policy "Admin reads manual entitlements" on public.studio_memberships for select to authenticated using (exists(select 1 from public.studio_admins where user_id=(select auth.uid())));
create policy "Admin grants complimentary manual membership" on public.studio_memberships for insert to authenticated with check (granted_by=(select auth.uid()) and exists(select 1 from public.studio_admins where user_id=(select auth.uid())));
create policy "Admin adjusts complimentary manual membership" on public.studio_memberships for update to authenticated using (exists(select 1 from public.studio_admins where user_id=(select auth.uid()))) with check (granted_by=(select auth.uid()) and exists(select 1 from public.studio_admins where user_id=(select auth.uid())));
