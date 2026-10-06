begin;
create table if not exists studio_private.health_events(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,service text not null check(service in('auth','database','payments','subscriptions','voice','ai','cloud','storage','editor','export','support')),code text not null check(code in('network','timeout','http401','http403','http404','http429','http500','validation','unknown')),created_at timestamptz not null default now());
create index if not exists health_events_owner_time on studio_private.health_events(user_id,created_at desc);
create index if not exists health_events_time on studio_private.health_events(created_at desc);
alter table studio_private.health_events enable row level security;
revoke all on studio_private.health_events from public,anon,authenticated;
grant select,insert,delete on studio_private.health_events to service_role;
create policy health_events_private on studio_private.health_events for all to authenticated using(false) with check(false);
create or replace function public.studio_health_report(owner_id uuid,service_name text,error_code text) returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if owner_id is null or service_name is null or service_name not in('auth','database','payments','subscriptions','voice','ai','cloud','storage','editor','export','support') or error_code is null or error_code not in('network','timeout','http401','http403','http404','http429','http500','validation','unknown') then raise exception 'Invalid diagnostic category';end if;
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text,615));
 if (select count(*) from studio_private.health_events where user_id=owner_id and created_at>now()-interval '5 minutes')>=10 then return false;end if;
 delete from studio_private.health_events where created_at<now()-interval '30 days';
 insert into studio_private.health_events(user_id,service,code) values(owner_id,service_name,error_code);return true;
end $$;
create or replace function public.studio_health_summary() returns jsonb language sql security invoker set search_path='' as $$
 select coalesce(jsonb_agg(x),'[]'::jsonb) from (select service,code,count(*) as occurrences,max(created_at) as last_seen from studio_private.health_events where created_at>now()-interval '24 hours' group by service,code order by max(created_at) desc limit 25)x
$$;
create table if not exists studio_private.support_ai_requests(id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,request_key uuid not null,created_at timestamptz not null default now(),unique(user_id,request_key));
create index if not exists support_ai_request_time on studio_private.support_ai_requests(created_at desc);
create index if not exists support_ai_owner_time on studio_private.support_ai_requests(user_id,created_at desc);
alter table studio_private.support_ai_requests enable row level security;
revoke all on studio_private.support_ai_requests from public,anon,authenticated;
grant select,insert,delete on studio_private.support_ai_requests to service_role;
create policy support_ai_private on studio_private.support_ai_requests for all to authenticated using(false) with check(false);
create or replace function public.studio_support_ai_claim(owner_id uuid,request_id uuid) returns boolean language plpgsql security invoker set search_path='' as $$
begin
 if owner_id is null or request_id is null then raise exception 'Verified request required';end if;
 perform pg_advisory_xact_lock(615426);
 if exists(select 1 from studio_private.support_ai_requests where user_id=owner_id and request_key=request_id) then return false;end if;
 if (select count(*) from studio_private.support_ai_requests where created_at>date_trunc('day',now()))>=50 or (select count(*) from studio_private.support_ai_requests where user_id=owner_id and created_at>date_trunc('day',now()))>=10 or exists(select 1 from studio_private.support_ai_requests where user_id=owner_id and created_at>now()-interval '10 seconds') then raise exception 'Support AI request limit reached';end if;
 delete from studio_private.support_ai_requests where created_at<now()-interval '30 days';
 insert into studio_private.support_ai_requests(user_id,request_key) values(owner_id,request_id);return true;
end $$;
revoke all on function public.studio_health_report(uuid,text,text),public.studio_health_summary(),public.studio_support_ai_claim(uuid,uuid) from public,anon,authenticated;
grant execute on function public.studio_health_report(uuid,text,text),public.studio_health_summary(),public.studio_support_ai_claim(uuid,uuid) to service_role;
commit;
