-- Admin-only operating records. Never store API keys or passwords here.
create table studio_private.service_register (
 service_id text primary key check(service_id in ('supabase','github','cashfree','sarvam','brevo','cloudflare','googleplay')),
 renewal_on date,
 account_email text not null default '' check(length(account_email)<=120 and (account_email='' or account_email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$')),
 state text not null default 'unknown' check(state in ('unknown','active','attention','inactive')),
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null
);
insert into studio_private.service_register(service_id) select unnest(array['supabase','github','cashfree','sarvam','brevo','cloudflare','googleplay']);
alter table studio_private.service_register enable row level security;
revoke all on studio_private.service_register from public,anon,authenticated;
create table studio_private.catalog_recovery (
 catalog_id text not null check(catalog_id in ('draft','published')),
 version bigint not null,
 payload jsonb not null,
 saved_at timestamptz not null default now(),
 saved_by uuid references auth.users(id) on delete set null,
 primary key(catalog_id,version)
);
alter table studio_private.catalog_recovery enable row level security;
revoke all on studio_private.catalog_recovery from public,anon,authenticated;
create table studio_private.operations_audit (
 id bigint generated always as identity primary key,
 action text not null,
 target text not null,
 actor uuid references auth.users(id) on delete set null,
 occurred_at timestamptz not null default now()
);
alter table studio_private.operations_audit enable row level security;
revoke all on studio_private.operations_audit from public,anon,authenticated;
create function studio_private.capture_catalog_recovery() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.payload is distinct from old.payload then
  insert into studio_private.catalog_recovery(catalog_id,version,payload,saved_by) values(old.id,old.version,old.payload,auth.uid()) on conflict do nothing;
  delete from studio_private.catalog_recovery where catalog_id=old.id and version not in(select version from studio_private.catalog_recovery where catalog_id=old.id order by version desc limit 5);
  insert into studio_private.operations_audit(action,target,actor) values('catalog_update',old.id||' v'||new.version,auth.uid());
  delete from studio_private.operations_audit where id not in(select id from studio_private.operations_audit order by id desc limit 100);
 end if;
 return new;
end $$;
revoke all on function studio_private.capture_catalog_recovery() from public,anon,authenticated;
create trigger studio_catalog_recovery before update on public.studio_catalogs for each row execute function studio_private.capture_catalog_recovery();
create function studio_private.admin_operations(action text,value jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); result jsonb; sid text; expiry date;
begin
 if u is null or not exists(select 1 from public.studio_admins where user_id=u) then raise exception 'Admin required'; end if;
 if pg_column_size(value)>4096 then raise exception 'Request too large'; end if;
 if action='service_save' then
  if value - array['service_id','renewal_on','account_email','state','expected_updated_at'] <> '{}'::jsonb then raise exception 'Unsupported field; never send secrets'; end if;
  sid:=value->>'service_id'; expiry:=nullif(value->>'renewal_on','')::date;
  if expiry is not null and (expiry<'2000-01-01'::date or expiry>'2100-12-31'::date) then raise exception 'Invalid renewal date'; end if;
  update studio_private.service_register set renewal_on=expiry,account_email=coalesce(value->>'account_email',''),state=coalesce(value->>'state','unknown'),updated_at=clock_timestamp(),updated_by=u
  where service_id=sid and updated_at=(value->>'expected_updated_at')::timestamptz;
  if not found then raise exception 'Record changed or service missing. Refresh before saving.'; end if;
  insert into studio_private.operations_audit(action,target,actor) values('service_save',sid,u);
 elsif action='recovery_get' then
  select payload into result from studio_private.catalog_recovery where catalog_id=value->>'catalog_id' and version=(value->>'version')::bigint;
  if result is null then raise exception 'Recovery version no longer retained. Refresh.'; end if;
  return jsonb_build_object('catalog_id',value->>'catalog_id','version',value->>'version','payload',result);
 elsif action<>'overview' then raise exception 'Unknown action'; end if;
 delete from studio_private.operations_audit where id not in(select id from studio_private.operations_audit order by id desc limit 100);
 return jsonb_build_object(
  'services',(select coalesce(jsonb_agg(to_jsonb(s) order by service_id),'[]'::jsonb) from studio_private.service_register s),
  'catalogs',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'version',version,'updated_at',updated_at,'bytes',pg_column_size(payload)) order by id),'[]'::jsonb) from public.studio_catalogs),
  'recovery',(select coalesce(jsonb_agg(x),'[]'::jsonb) from(select catalog_id,version,saved_at,pg_column_size(payload) as bytes from studio_private.catalog_recovery order by saved_at desc)x),
  'audit',(select coalesce(jsonb_agg(x),'[]'::jsonb) from(select a.action,a.target,a.occurred_at from studio_private.operations_audit a order by a.id desc limit 30)x)
 );
end $$;
revoke all on function studio_private.admin_operations(text,jsonb) from public,anon;
grant execute on function studio_private.admin_operations(text,jsonb) to authenticated;
create function public.studio_admin_operations(action text,value jsonb default '{}'::jsonb) returns jsonb language sql security invoker set search_path='' as 'select studio_private.admin_operations(action,value)';
revoke all on function public.studio_admin_operations(text,jsonb) from public,anon;
grant execute on function public.studio_admin_operations(text,jsonb) to authenticated;
