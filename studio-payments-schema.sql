-- Cashfree orders are server-only. Sandbox entitlements never grant live access.
create table studio_private.payment_orders (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 environment text not null check(environment in('sandbox','production')),
 plan text not null check(plan in('registration','manual')),
 amount_paise integer not null check(amount_paise in(1000,10000)),
 status text not null default 'pending' check(status in('pending','paid')),
 session_id text, payment_id text,
 created_at timestamptz not null default now(), fulfilled_at timestamptz,
 unique(environment,payment_id),
 check((plan='registration' and amount_paise=1000) or (plan='manual' and amount_paise=10000))
);
create index studio_payment_owner on studio_private.payment_orders(user_id,environment,created_at desc);
alter table studio_private.payment_orders enable row level security;
revoke all on studio_private.payment_orders from public,anon,authenticated;
grant select,insert,update on studio_private.payment_orders to service_role;
create table public.studio_paid_memberships (
 user_id uuid not null references auth.users(id) on delete cascade,
 environment text not null check(environment in('sandbox','production')),
 expires_at timestamptz not null, updated_at timestamptz not null default now(),
 primary key(user_id,environment)
);
alter table public.studio_paid_memberships enable row level security;
revoke all on public.studio_paid_memberships from public,anon,authenticated;
grant select on public.studio_paid_memberships to authenticated;
grant all on public.studio_paid_memberships to service_role;
create policy "Own paid membership" on public.studio_paid_memberships for select to authenticated using(user_id=(select auth.uid()));
create policy "Admin reads paid membership" on public.studio_paid_memberships for select to authenticated using(exists(select 1 from public.studio_admins where user_id=(select auth.uid())));

create function public.studio_payment_reserve(owner_id uuid,env text,requested_plan text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare r studio_private.payment_orders;
begin
 if env is null or env not in('sandbox','production') or requested_plan is null or requested_plan not in('registration','manual') then raise exception 'Invalid plan/environment'; end if;
 -- The service-only Edge caller validates the verified account with Auth before reserving.
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text,912));
 if requested_plan='registration' and (exists(select 1 from studio_private.payment_orders where user_id=owner_id and environment=env and plan='registration' and status='paid') or (env='production' and exists(select 1 from public.studio_trials where user_id=owner_id))) then raise exception 'Trial already used. Choose Manual renewal.'; end if;
 select * into r from studio_private.payment_orders where user_id=owner_id and environment=env and plan=requested_plan and status='pending' and created_at>now()-interval '30 minutes' order by created_at desc limit 1;
 if found then return to_jsonb(r); end if;
 if (select count(*) from studio_private.payment_orders where user_id=owner_id and created_at>now()-interval '1 day')>=10 then raise exception 'Daily checkout limit reached'; end if;
 insert into studio_private.payment_orders(user_id,environment,plan,amount_paise) values(owner_id,env,requested_plan,case when requested_plan='registration' then 1000 else 10000 end) returning * into r;
 return to_jsonb(r);
end $$;
create function public.studio_payment_order(order_uuid uuid) returns jsonb language sql security invoker set search_path='' as $$select to_jsonb(o) from studio_private.payment_orders o where id=order_uuid$$;
create function public.studio_payment_session(order_uuid uuid,session_value text) returns void language sql security invoker set search_path='' as $$update studio_private.payment_orders set session_id=session_value where id=order_uuid and status='pending'$$;
create function public.studio_payment_fulfill(order_uuid uuid,env text,amount integer,currency text,provider_payment_id text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare r studio_private.payment_orders; expiry timestamptz;
begin
 select * into r from studio_private.payment_orders where id=order_uuid;
 if not found then raise exception 'Unknown order'; end if;
 perform pg_advisory_xact_lock(hashtextextended(r.user_id::text,912));
 select * into r from studio_private.payment_orders where id=order_uuid for update;
 if env is distinct from r.environment or amount is distinct from r.amount_paise or currency is distinct from 'INR' or coalesce(provider_payment_id,'')='' then raise exception 'Payment does not match order'; end if;
 if r.status='paid' then return jsonb_build_object('paid',true,'duplicate',true,'environment',r.environment); end if;
 if r.plan='registration' then
  if exists(select 1 from studio_private.payment_orders where user_id=r.user_id and environment=env and plan='registration' and status='paid') then raise exception 'Registration already fulfilled'; end if;
  if env='production' then
   insert into public.studio_trials(user_id) values(r.user_id) on conflict(user_id) do nothing;
   select expires_at into expiry from public.studio_trials where user_id=r.user_id;
  else expiry:=now()+interval '15 days'; end if;
 else
  select expires_at into expiry from public.studio_paid_memberships where user_id=r.user_id and environment=env;
  expiry:=greatest(now(),coalesce(expiry,now()))+interval '30 days';
  insert into public.studio_paid_memberships(user_id,environment,expires_at) values(r.user_id,env,expiry)
  on conflict(user_id,environment) do update set expires_at=excluded.expires_at,updated_at=now();
 end if;
 update studio_private.payment_orders set status='paid',payment_id=provider_payment_id,fulfilled_at=now() where id=order_uuid;
 return jsonb_build_object('paid',true,'duplicate',false,'environment',env,'expires_at',expiry);
end $$;
revoke all on function public.studio_payment_reserve(uuid,text,text),public.studio_payment_order(uuid),public.studio_payment_session(uuid,text),public.studio_payment_fulfill(uuid,text,integer,text,text) from public,anon,authenticated;
grant execute on function public.studio_payment_reserve(uuid,text,text),public.studio_payment_order(uuid),public.studio_payment_session(uuid,text),public.studio_payment_fulfill(uuid,text,integer,text,text) to service_role;
grant usage on schema studio_private to service_role;

grant select,insert on public.studio_trials to service_role;
