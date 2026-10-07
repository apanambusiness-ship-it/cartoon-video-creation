create table if not exists studio_private.deletion_requests (
 user_id uuid primary key, requested_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 status text not null default 'requested' check(status in ('requested','reviewing','cancelled','completed')),
 admin_note text not null default '' check(length(admin_note)<=1000)
);
alter table studio_private.deletion_requests enable row level security;
revoke all on studio_private.deletion_requests from public,anon,authenticated;
create or replace function studio_private.account_deletion(action text,value jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); result jsonb; target uuid;
begin
 if uid is null then raise exception 'Login required' using errcode='42501'; end if;
 if pg_column_size(value)>4096 then raise exception 'Request too large'; end if;
 if action in ('status','request','cancel') then
  if action='request' then
   if value->>'confirmation'<>'DELETE' or coalesce(value->>'confirmation','')='' then raise exception 'Confirm DELETE'; end if;
   insert into studio_private.deletion_requests(user_id) values(uid)
   on conflict(user_id) do update set status='requested',requested_at=now(),updated_at=now(),admin_note=''
   where studio_private.deletion_requests.status='cancelled';
  elsif action='cancel' then
   update studio_private.deletion_requests set status='cancelled',updated_at=now() where user_id=uid and status='requested';
  end if;
  select jsonb_build_object('status',r.status,'requested_at',r.requested_at,'updated_at',r.updated_at,'admin_note',r.admin_note) into result from studio_private.deletion_requests r where r.user_id=uid;
  return coalesce(result,'null'::jsonb);
 end if;
 if not exists(select 1 from public.studio_admins a where a.user_id=uid) then raise exception 'Admin required' using errcode='42501'; end if;
 if action='admin_list' then
  select coalesce(jsonb_agg(to_jsonb(r)),'[]'::jsonb) into result from (select d.* from studio_private.deletion_requests d where d.status in ('requested','reviewing') order by d.requested_at limit 100) r;
  return result;
 elsif action='admin_update' then
  target:=(value->>'user_id')::uuid;
  if value->>'status' not in ('reviewing','completed') then raise exception 'Invalid status'; end if;
  if value->>'status'='completed' and not (coalesce((value->>'identity_checked')::boolean,false) and coalesce((value->>'autopay_checked')::boolean,false) and coalesce((value->>'balance_checked')::boolean,false) and coalesce((value->>'data_checked')::boolean,false) and coalesce((value->>'sessions_checked')::boolean,false)) then raise exception 'Complete every verification first'; end if;
  if coalesce(length(value->>'admin_note'),0) not between 1 and 1000 then raise exception 'User-facing outcome required'; end if;
  update studio_private.deletion_requests set status=value->>'status',admin_note=value->>'admin_note',updated_at=now() where user_id=target and status in ('requested','reviewing') and updated_at=(value->>'expected_updated_at')::timestamptz returning to_jsonb(deletion_requests) into result;
  if result is null then raise exception 'Request changed; refresh first'; end if;
  return result;
 end if;
 raise exception 'Invalid action';
end $$;
revoke all on function studio_private.account_deletion(text,jsonb) from public,anon;
grant execute on function studio_private.account_deletion(text,jsonb) to authenticated;
create or replace function public.studio_account_deletion(action text,value jsonb default '{}'::jsonb)
returns jsonb language sql security invoker set search_path='' as $$ select studio_private.account_deletion(action,value) $$;
revoke all on function public.studio_account_deletion(text,jsonb) from public,anon;
grant execute on function public.studio_account_deletion(text,jsonb) to authenticated;
