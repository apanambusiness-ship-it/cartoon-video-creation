-- ₹100 every 30 days, explicit mandate consent, no entitlement for authorization alone.
begin;
create table if not exists studio_private.subscriptions (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,
 environment text not null check(environment in('sandbox','production')),
 status text not null default 'INITIALIZED' check(status in('INITIALIZED','BANK_APPROVAL_PENDING','ACTIVE','ON_HOLD','PAUSED','CUSTOMER_PAUSED','CUSTOMER_CANCELLED','CANCELLED','COMPLETED','EXPIRED','LINK_EXPIRED','CARD_EXPIRED')),
 consent_version text not null check(consent_version='100-per-30-days-v1'),consented_at timestamptz not null default now(),
 first_charge_at timestamptz not null,session_id text,provider_id text,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 cancel_key uuid not null default gen_random_uuid(),cancel_requested_at timestamptz
);
create unique index if not exists studio_one_open_subscription on studio_private.subscriptions(user_id,environment) where status not in('CUSTOMER_CANCELLED','CANCELLED','COMPLETED','EXPIRED','LINK_EXPIRED','CARD_EXPIRED');
create table if not exists studio_private.subscription_payments (
 id uuid primary key default gen_random_uuid(),subscription_id uuid not null references studio_private.subscriptions(id),environment text not null check(environment in('production','sandbox')),
 provider_payment_id text not null,scheduled_at timestamptz not null,amount_paise integer not null check(amount_paise=10000),fulfilled_at timestamptz not null default now(),expires_at timestamptz not null,
 unique(environment,provider_payment_id),unique(subscription_id,scheduled_at)
);
alter table studio_private.subscriptions enable row level security;
alter table studio_private.subscription_payments enable row level security;
revoke all on studio_private.subscriptions,studio_private.subscription_payments from public,anon,authenticated;
grant select,insert,update on studio_private.subscriptions,studio_private.subscription_payments to service_role;
create or replace function public.studio_subscription_reserve(owner_id uuid,env text,consent text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r studio_private.subscriptions;first_at timestamptz;
begin
 if owner_id is null or env is null or env not in('sandbox','production') or consent is distinct from '100-per-30-days-v1' then raise exception 'Explicit AutoPay consent required';end if;
 if env='production' and not exists(select 1 from public.studio_business_settings where id and payments_enabled) then raise exception 'Live membership payments not active';end if;
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text,912));
 select * into r from studio_private.subscriptions where user_id=owner_id and environment=env and status not in('CUSTOMER_CANCELLED','CANCELLED','COMPLETED','EXPIRED','LINK_EXPIRED','CARD_EXPIRED');
 if found then return to_jsonb(r);end if;
 if (select count(*) from studio_private.subscriptions where user_id=owner_id and created_at>now()-interval '1 day')>=3 then raise exception 'Daily mandate limit';end if;
 -- Cashfree handles pre-debit notifications. Allow three days to set up the first debit.
 first_at:=date_trunc('second',now()+interval '3 days');
 select greatest(first_at,coalesce(max(expires_at),first_at)) into first_at from public.studio_paid_memberships where user_id=owner_id and environment=env;
 if env='production' then
  select greatest(first_at,coalesce(max(expires_at),first_at)) into first_at from public.studio_trials where user_id=owner_id;
  select greatest(first_at,coalesce(max(expires_at),first_at)) into first_at from public.studio_memberships where user_id=owner_id and not revoked;
 end if;
 insert into studio_private.subscriptions(user_id,environment,consent_version,first_charge_at) values(owner_id,env,consent,first_at) returning * into r;return to_jsonb(r);
end $$;
create or replace function public.studio_subscription_record(subscription_uuid uuid) returns jsonb language sql security invoker set search_path='' as $$select to_jsonb(s) from studio_private.subscriptions s where id=subscription_uuid$$;
create or replace function public.studio_subscription_list(owner_id uuid,env text) returns jsonb language sql security invoker set search_path='' as $$select coalesce(jsonb_agg(s),'[]'::jsonb) from (select id,environment,status,first_charge_at,consented_at,cancel_requested_at from studio_private.subscriptions where user_id=owner_id and environment=env order by created_at desc limit 10)s$$;
create or replace function public.studio_subscription_sync(subscription_uuid uuid,provider_reference text,provider_status text,session_value text default null,cancel_requested boolean default false) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r studio_private.subscriptions;
begin
 select * into r from studio_private.subscriptions where id=subscription_uuid;
 if not found then raise exception 'Unknown subscription';end if;
 perform pg_advisory_xact_lock(hashtextextended(r.user_id::text,912));
 select * into r from studio_private.subscriptions where id=subscription_uuid for update;
 if coalesce(provider_reference,'')='' or (r.provider_id is not null and r.provider_id<>provider_reference) then raise exception 'Provider subscription mismatch';end if;
 if r.status in('CUSTOMER_CANCELLED','CANCELLED','COMPLETED','EXPIRED','LINK_EXPIRED','CARD_EXPIRED') and provider_status not in('CUSTOMER_CANCELLED','CANCELLED','COMPLETED','EXPIRED','LINK_EXPIRED','CARD_EXPIRED') then raise exception 'Terminal mandate cannot reopen';end if;
 update studio_private.subscriptions set provider_id=provider_reference,status=provider_status,session_id=coalesce(session_value,session_id),cancel_requested_at=case when cancel_requested then coalesce(cancel_requested_at,now()) else cancel_requested_at end,updated_at=now() where id=subscription_uuid returning * into r;return to_jsonb(r);
end $$;
create or replace function public.studio_subscription_fulfill(subscription_uuid uuid,env text,provider_payment_id text,provider_reference text,amount integer,currency text,payment_type text,payment_status text,scheduled_at timestamptz) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r studio_private.subscriptions; p studio_private.subscription_payments; expiry timestamptz;
begin
 select * into r from studio_private.subscriptions where id=subscription_uuid;
 if not found then raise exception 'Unknown subscription';end if;
 perform pg_advisory_xact_lock(hashtextextended(r.user_id::text,912));
 if env is distinct from r.environment or provider_reference is distinct from r.provider_id or coalesce(provider_payment_id,'')='' or amount is distinct from 10000 or currency is distinct from 'INR' or payment_type is distinct from 'CHARGE' or payment_status is distinct from 'SUCCESS' or scheduled_at is null or scheduled_at<r.first_charge_at-interval '1 minute' or scheduled_at>now()+interval '1 day' then raise exception 'Recurring payment mismatch';end if;
 select * into p from studio_private.subscription_payments where environment=env and subscription_payments.provider_payment_id=studio_subscription_fulfill.provider_payment_id;
 if found then
  if p.subscription_id<>r.id then raise exception 'Payment belongs to another mandate';end if;
  return jsonb_build_object('paid',true,'duplicate',true,'expires_at',p.expires_at);
 end if;
 if exists(select 1 from studio_private.subscription_payments where subscription_id=r.id and subscription_payments.scheduled_at=studio_subscription_fulfill.scheduled_at) then raise exception 'Cycle already credited; reconcile duplicate debit';end if;
 select expires_at into expiry from public.studio_paid_memberships where user_id=r.user_id and environment=env;
 expiry:=greatest(now(),coalesce(expiry,now()))+interval '30 days';
 insert into studio_private.subscription_payments(subscription_id,environment,provider_payment_id,scheduled_at,amount_paise,expires_at) values(r.id,env,provider_payment_id,scheduled_at,10000,expiry);
 insert into public.studio_paid_memberships(user_id,environment,expires_at) values(r.user_id,env,expiry) on conflict(user_id,environment) do update set expires_at=excluded.expires_at,updated_at=now();
 return jsonb_build_object('paid',true,'duplicate',false,'expires_at',expiry,'environment',env);
end $$;
revoke all on function public.studio_subscription_reserve(uuid,text,text),public.studio_subscription_record(uuid),public.studio_subscription_list(uuid,text),public.studio_subscription_sync(uuid,text,text,text,boolean),public.studio_subscription_fulfill(uuid,text,text,text,integer,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.studio_subscription_reserve(uuid,text,text),public.studio_subscription_record(uuid),public.studio_subscription_list(uuid,text),public.studio_subscription_sync(uuid,text,text,text,boolean),public.studio_subscription_fulfill(uuid,text,text,text,integer,text,text,text,timestamptz) to service_role;
drop policy if exists "No direct client access" on studio_private.subscriptions;
create policy "No direct client access" on studio_private.subscriptions for all to authenticated using(false) with check(false);
drop policy if exists "No direct client access" on studio_private.subscription_payments;
create policy "No direct client access" on studio_private.subscription_payments for all to authenticated using(false) with check(false);
notify pgrst,'reload schema';
commit;
