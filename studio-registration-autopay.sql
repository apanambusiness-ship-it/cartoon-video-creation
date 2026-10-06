begin;
alter table studio_private.payment_orders add column if not exists autopay_consent_version text check(autopay_consent_version is null or autopay_consent_version='registration-10-trial15-autopay100-30-v1');
alter table studio_private.payment_orders add column if not exists autopay_consented_at timestamptz;
create or replace function public.studio_registration_reserve(owner_id uuid,env text,consent text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare r jsonb;
begin
 if consent is distinct from 'registration-10-trial15-autopay100-30-v1' then raise exception 'Registration AutoPay consent required';end if;
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text,912));
 if exists(select 1 from studio_private.subscriptions where user_id=owner_id and environment=env and status not in('CUSTOMER_CANCELLED','CANCELLED','COMPLETED','EXPIRED','LINK_EXPIRED','CARD_EXPIRED')) then raise exception 'Existing AutoPay found. Check membership before registration.';end if;
 r:=public.studio_payment_reserve(owner_id,env,'registration');
 update studio_private.payment_orders set autopay_consent_version=consent,autopay_consented_at=coalesce(autopay_consented_at,now()) where id=(r->>'id')::uuid;
 return r;
end $$;
create or replace function public.studio_registration_status(owner_id uuid,env text) returns jsonb language sql security invoker set search_path='' as $$
 select jsonb_build_object('order_id','apn_'||id,'paid',status='paid','consent_version',autopay_consent_version,'trial_ends_at',case when status='paid' then fulfilled_at+interval '15 days' end,'autopay_status',(select s.status from studio_private.subscriptions s where s.user_id=owner_id and s.environment=env order by s.created_at desc limit 1))
 from studio_private.payment_orders where user_id=owner_id and environment=env and plan='registration' and autopay_consent_version is not null order by created_at desc limit 1
$$;
create or replace function public.studio_registration_subscription(owner_id uuid,env text,order_uuid uuid) returns jsonb language plpgsql security invoker set search_path='' as $$
declare o studio_private.payment_orders;r jsonb;
begin
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text,912));
 select * into o from studio_private.payment_orders where id=order_uuid and user_id=owner_id and environment=env and plan='registration' and status='paid' and autopay_consent_version='registration-10-trial15-autopay100-30-v1';
 if not found then raise exception 'Verified registration for this account required';end if;
 r:=public.studio_subscription_reserve(owner_id,env,'100-per-30-days-v1');
 if (r->>'first_charge_at')::timestamptz<o.fulfilled_at+interval '15 days' then raise exception 'Existing mandate date precedes trial end. Cancel it before continuing.';end if;
 return r;
end $$;
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
 select greatest(first_at,coalesce(max(fulfilled_at + interval '15 days'),first_at)) into first_at from studio_private.payment_orders where user_id=owner_id and environment=env and plan='registration' and status='paid';
 if env='production' then
  select greatest(first_at,coalesce(max(expires_at),first_at)) into first_at from public.studio_trials where user_id=owner_id;
  select greatest(first_at,coalesce(max(expires_at),first_at)) into first_at from public.studio_memberships where user_id=owner_id and not revoked;
 end if;
 insert into studio_private.subscriptions(user_id,environment,consent_version,first_charge_at) values(owner_id,env,consent,first_at) returning * into r;return to_jsonb(r);
end $$;
revoke all on function public.studio_registration_reserve(uuid,text,text),public.studio_registration_status(uuid,text),public.studio_registration_subscription(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.studio_registration_reserve(uuid,text,text),public.studio_registration_status(uuid,text),public.studio_registration_subscription(uuid,text,uuid) to service_role;
commit;
