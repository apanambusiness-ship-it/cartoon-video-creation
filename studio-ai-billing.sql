-- Separate prepaid AI service balance. Membership prices/dates remain unchanged.
begin;
create or replace function studio_private.start_trial() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); r public.studio_trials;
begin
 if u is null then raise exception 'Login required'; end if;
 select * into r from public.studio_trials where user_id=u;
 if not found then raise exception '₹10 Registration payment confirmation required for 15-day trial'; end if;
 return to_jsonb(r);
end $$;
revoke all on function studio_private.start_trial() from public,anon;
grant execute on function studio_private.start_trial() to authenticated;

create table studio_private.ai_balances (
 user_id uuid not null references auth.users(id) on delete cascade,
 environment text not null check(environment in('production','sandbox')),
 available_paise bigint not null default 0 check(available_paise>=0),
 held_paise bigint not null default 0 check(held_paise>=0),
 primary key(user_id,environment)
);
create table studio_private.ai_topups (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 environment text not null check(environment in('production','sandbox')),
 amount_paise integer not null check(amount_paise in(5000,10000,20000,50000)),
 status text not null default 'pending' check(status in('pending','paid')),
 session_id text,payment_id text,created_at timestamptz not null default now(),fulfilled_at timestamptz,
 unique(environment,payment_id)
);
create index ai_topup_owner on studio_private.ai_topups(user_id,environment,created_at desc);
create table studio_private.ai_jobs (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 environment text not null check(environment in('production','sandbox')),
 request_key uuid not null,kind text not null check(kind in('poster','audio','video')),
 units integer not null check(units between 1 and 60),
 charge_paise bigint not null check(charge_paise>0),provider_estimate_paise bigint not null check(provider_estimate_paise>0),
 provider_cost_paise bigint check(provider_cost_paise>=0),margin_paise bigint,
 state text not null default 'reserved' check(state in('reserved','processing','ready','failed','uncertain')),
 provider_reference text,result_path text,created_at timestamptz not null default now(),finished_at timestamptz,
 unique(user_id,environment,request_key)
);
create index ai_job_owner on studio_private.ai_jobs(user_id,environment,created_at desc);
create table studio_private.ai_ledger (
 id bigint generated always as identity primary key,user_id uuid not null references auth.users(id) on delete cascade,
 environment text not null check(environment in('production','sandbox')),
 event text not null check(event in('topup','reserve','charge','release')),
 reference uuid not null,amount_paise bigint not null check(amount_paise>0),created_at timestamptz not null default now(),
 unique(environment,event,reference)
);
create index ai_ledger_owner on studio_private.ai_ledger(user_id,environment,created_at desc);
alter table studio_private.ai_balances enable row level security;
alter table studio_private.ai_topups enable row level security;
alter table studio_private.ai_jobs enable row level security;
alter table studio_private.ai_ledger enable row level security;
revoke all on studio_private.ai_balances,studio_private.ai_topups,studio_private.ai_jobs,studio_private.ai_ledger from public,anon,authenticated;
grant select,insert,update on studio_private.ai_balances,studio_private.ai_topups,studio_private.ai_jobs,studio_private.ai_ledger to service_role;
grant usage,select on sequence studio_private.ai_ledger_id_seq to service_role;

create function public.studio_ai_topup_reserve(owner_id uuid,env text,amount integer) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r studio_private.ai_topups;
begin
 if owner_id is null or env is null or env not in('production','sandbox') or amount is null or amount not in(5000,10000,20000,50000) then raise exception 'Invalid AI topup'; end if;
 -- Verified Auth identity is supplied only by the service-only Edge handler.
 if env='production' and not exists(select 1 from public.studio_paid_memberships where user_id=owner_id and environment='production' and expires_at>now() union all select 1 from public.studio_memberships where user_id=owner_id and not revoked and expires_at>now() union all select 1 from public.studio_trials where user_id=owner_id and expires_at>now()) then raise exception 'Active membership required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text||env,917));
 select * into r from studio_private.ai_topups where user_id=owner_id and environment=env and amount_paise=amount and status='pending' and created_at>now()-interval '30 minutes' order by created_at desc limit 1;
 if found then return to_jsonb(r); end if;
 if (select count(*) from studio_private.ai_topups where user_id=owner_id and created_at>now()-interval '1 day')>=10 then raise exception 'Daily checkout limit'; end if;
 insert into studio_private.ai_topups(user_id,environment,amount_paise) values(owner_id,env,amount) returning * into r; return to_jsonb(r);
end $$;
create function public.studio_ai_topup_order(order_uuid uuid) returns jsonb language sql security invoker set search_path='' as $$select to_jsonb(o) from studio_private.ai_topups o where id=order_uuid$$;
create function public.studio_ai_topup_session(order_uuid uuid,session_value text) returns void language sql security invoker set search_path='' as $$update studio_private.ai_topups set session_id=session_value where id=order_uuid and status='pending'$$;
create function public.studio_ai_topup_fulfill(order_uuid uuid,env text,amount integer,currency text,provider_payment_id text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r studio_private.ai_topups;
begin
 select * into r from studio_private.ai_topups where id=order_uuid;
 if not found then raise exception 'Unknown topup'; end if;
 perform pg_advisory_xact_lock(hashtextextended(r.user_id::text||r.environment,917));
 select * into r from studio_private.ai_topups where id=order_uuid for update;
 if env is distinct from r.environment or amount is distinct from r.amount_paise or currency is distinct from 'INR' or coalesce(provider_payment_id,'')='' then raise exception 'Payment mismatch'; end if;
 if r.status='paid' then return jsonb_build_object('paid',true,'duplicate',true,'environment',env); end if;
 insert into studio_private.ai_balances(user_id,environment,available_paise) values(r.user_id,env,amount) on conflict(user_id,environment) do update set available_paise=studio_private.ai_balances.available_paise+excluded.available_paise;
 insert into studio_private.ai_ledger(user_id,environment,event,reference,amount_paise) values(r.user_id,env,'topup',r.id,amount);
 update studio_private.ai_topups set status='paid',payment_id=provider_payment_id,fulfilled_at=now() where id=r.id;
 return jsonb_build_object('paid',true,'duplicate',false,'environment',env,'credited_paise',amount);
end $$;

create function public.studio_ai_job_reserve(owner_id uuid,env text,request_id uuid,request_kind text,request_units integer,maximum_paise bigint) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r public.studio_ai_rates;j studio_private.ai_jobs; price bigint; cost bigint;
begin
 if owner_id is null or env is null or env not in('production','sandbox') or request_id is null or request_units is null or request_units not between 1 and 60 or maximum_paise is null or maximum_paise<1 then raise exception 'Invalid AI request'; end if;
 -- Verified Auth identity is supplied only by the service-only Edge handler.
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text||env,917));
 select * into j from studio_private.ai_jobs where user_id=owner_id and environment=env and request_key=request_id;
 if found then
  if j.kind is distinct from request_kind or j.units is distinct from request_units then raise exception 'Request key reused for different job'; end if;
  return to_jsonb(j);
 end if;
 if env='production' then
  if not exists(select 1 from public.studio_business_settings where id and ai_enabled) then raise exception 'Paid AI not active'; end if;
  if not exists(select 1 from public.studio_paid_memberships where user_id=owner_id and environment='production' and expires_at>now() union all select 1 from public.studio_memberships where user_id=owner_id and not revoked and expires_at>now() union all select 1 from public.studio_trials where user_id=owner_id and expires_at>now()) then raise exception 'Active membership required'; end if;
 end if;
 select * into r from public.studio_ai_rates where kind=request_kind;
 if not found or r.provider_cost_paise is null or r.provider_name='' then raise exception 'Provider pricing not configured'; end if;
 cost:=r.provider_cost_paise::bigint*request_units;price:=ceil(cost::numeric*100/(100-r.margin_percent));
 if price>maximum_paise then raise exception 'Price exceeds approved budget; request a new quote'; end if;
 update studio_private.ai_balances set available_paise=available_paise-price,held_paise=held_paise+price where user_id=owner_id and environment=env and available_paise>=price;
 if not found then raise exception 'Insufficient AI balance'; end if;
 insert into studio_private.ai_jobs(user_id,environment,request_key,kind,units,charge_paise,provider_estimate_paise) values(owner_id,env,request_id,request_kind,request_units,price,cost) returning * into j;
 insert into studio_private.ai_ledger(user_id,environment,event,reference,amount_paise) values(owner_id,env,'reserve',j.id,price);
 return to_jsonb(j);
end $$;
create function public.studio_ai_job_settle(job_id uuid,outcome text,actual_cost bigint default null,output_path text default null) returns jsonb language plpgsql security invoker set search_path='' as $$
declare j studio_private.ai_jobs;
begin
 select * into j from studio_private.ai_jobs where id=job_id;
 if not found then raise exception 'Unknown AI job'; end if;
 perform pg_advisory_xact_lock(hashtextextended(j.user_id::text||j.environment,917));
 select * into j from studio_private.ai_jobs where id=job_id for update;
 if outcome is null or outcome not in('ready','failed','uncertain') then raise exception 'Invalid outcome'; end if;
 if j.state in('ready','failed') then return to_jsonb(j); end if;
 if outcome='uncertain' then update studio_private.ai_jobs set state='uncertain' where id=j.id;return jsonb_build_object('state','uncertain','held_paise',j.charge_paise);end if;
 if outcome='ready' and (actual_cost is null or actual_cost<0 or actual_cost>j.provider_estimate_paise or coalesce(output_path,'')='' or output_path not like j.user_id::text||'/%') then raise exception 'Verified output/cost required'; end if;
 update studio_private.ai_balances set held_paise=held_paise-j.charge_paise,available_paise=available_paise+case when outcome='failed' then j.charge_paise else 0 end where user_id=j.user_id and environment=j.environment and held_paise>=j.charge_paise;
 if not found then raise exception 'Balance reconciliation required';end if;
 insert into studio_private.ai_ledger(user_id,environment,event,reference,amount_paise) values(j.user_id,j.environment,case when outcome='failed' then 'release' else 'charge' end,j.id,j.charge_paise);
 update studio_private.ai_jobs set state=outcome,provider_cost_paise=case when outcome='ready' then actual_cost end,margin_paise=case when outcome='ready' then charge_paise-actual_cost end,result_path=case when outcome='ready' then output_path end,finished_at=now() where id=j.id returning * into j;
 return to_jsonb(j);
end $$;
revoke all on function public.studio_ai_topup_reserve(uuid,text,integer),public.studio_ai_topup_order(uuid),public.studio_ai_topup_session(uuid,text),public.studio_ai_topup_fulfill(uuid,text,integer,text,text),public.studio_ai_job_reserve(uuid,text,uuid,text,integer,bigint),public.studio_ai_job_settle(uuid,text,bigint,text) from public,anon,authenticated;
grant execute on function public.studio_ai_topup_reserve(uuid,text,integer),public.studio_ai_topup_order(uuid),public.studio_ai_topup_session(uuid,text),public.studio_ai_topup_fulfill(uuid,text,integer,text,text),public.studio_ai_job_reserve(uuid,text,uuid,text,integer,bigint),public.studio_ai_job_settle(uuid,text,bigint,text) to service_role;
-- Auth-owned lookup lives in the private schema and checks the requesting user.
create function studio_private.ai_account() returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();
begin
 if u is null then raise exception 'Login required';end if;
 return jsonb_build_object('balances',coalesce((select jsonb_agg(b) from (select environment,available_paise,held_paise from studio_private.ai_balances where user_id=u)b),'[]'::jsonb),'jobs',coalesce((select jsonb_agg(j) from (select id,environment,kind,units,charge_paise,state,created_at,finished_at from studio_private.ai_jobs where user_id=u order by created_at desc limit 25)j),'[]'::jsonb),'ledger',coalesce((select jsonb_agg(l) from (select environment,event,amount_paise,reference,created_at from studio_private.ai_ledger where user_id=u order by created_at desc,id desc limit 25)l),'[]'::jsonb));
end $$;
revoke all on function studio_private.ai_account() from public,anon;grant execute on function studio_private.ai_account() to authenticated;
create function public.studio_ai_account() returns jsonb language sql security invoker set search_path='' as $$select studio_private.ai_account()$$;
revoke all on function public.studio_ai_account() from public,anon;grant execute on function public.studio_ai_account() to authenticated;
create function studio_private.ai_business_summary() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.studio_admins where user_id=auth.uid()) then raise exception 'Admin required';end if;
 return jsonb_build_object('summary',coalesce((select jsonb_agg(s) from (select environment,count(*) filter(where state='ready') completed,count(*) filter(where state in('reserved','processing','uncertain')) pending,coalesce(sum(charge_paise) filter(where state='ready'),0) revenue_paise,coalesce(sum(provider_cost_paise) filter(where state='ready'),0) provider_cost_paise,coalesce(sum(margin_paise) filter(where state='ready'),0) gross_margin_paise from studio_private.ai_jobs group by environment)s),'[]'::jsonb),'balances',coalesce((select jsonb_agg(b) from (select environment,sum(available_paise) available_paise,sum(held_paise) held_paise from studio_private.ai_balances group by environment)b),'[]'::jsonb));
end $$;
revoke all on function studio_private.ai_business_summary() from public,anon;grant execute on function studio_private.ai_business_summary() to authenticated;
create function public.studio_ai_business_summary() returns jsonb language sql security invoker set search_path='' as $$select studio_private.ai_business_summary()$$;
revoke all on function public.studio_ai_business_summary() from public,anon;grant execute on function public.studio_ai_business_summary() to authenticated;
create policy "No direct client access" on studio_private.ai_balances for all to authenticated using(false) with check(false);
create policy "No direct client access" on studio_private.ai_topups for all to authenticated using(false) with check(false);
create policy "No direct client access" on studio_private.ai_jobs for all to authenticated using(false) with check(false);
create policy "No direct client access" on studio_private.ai_ledger for all to authenticated using(false) with check(false);
-- The existing overview now reports the caller's actual entitlement; deployed separately.
notify pgrst,'reload schema';
commit;
