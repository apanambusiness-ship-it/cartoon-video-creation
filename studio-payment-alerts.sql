-- Private recipient settings are configured separately; never commit real recipients.
create table if not exists studio_private.admin_payment_alert_settings (
 id boolean primary key default true check(id),
 whatsapp_recipient text not null check(whatsapp_recipient ~ '^91[6-9][0-9]{9}$'),
 whatsapp_enabled boolean not null default false,
 updated_at timestamptz not null default now(),
 email_recipient text,email_enabled boolean not null default false
);
alter table studio_private.admin_payment_alert_settings enable row level security;
revoke all on studio_private.admin_payment_alert_settings from public,anon,authenticated;
grant select on studio_private.admin_payment_alert_settings to service_role;
create table studio_private.payment_alert_queue (
 order_id uuid primary key references studio_private.payment_orders(id) on delete cascade,
 status text not null default 'pending' check(status in('pending','sending','accepted','failed','uncertain')),
 created_at timestamptz not null default now(), attempted_at timestamptz,
 provider_message_id text, result_code text
);
alter table studio_private.payment_alert_queue enable row level security;
revoke all on studio_private.payment_alert_queue from public,anon,authenticated;
grant select,insert,update on studio_private.payment_alert_queue to service_role;
create index studio_payment_alert_pending on studio_private.payment_alert_queue(created_at) where status='pending';
create function studio_private.queue_payment_alert() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.environment='production' and new.status='paid' and old.status is distinct from 'paid' then
 insert into studio_private.payment_alert_queue(order_id) values(new.id) on conflict do nothing;
 end if;
 return new;
end $$;
revoke all on function studio_private.queue_payment_alert() from public,anon,authenticated;
create trigger studio_queue_payment_alert after update of status on studio_private.payment_orders
for each row execute function studio_private.queue_payment_alert();
create function public.studio_claim_payment_alerts() returns jsonb
language plpgsql security invoker set search_path='' as $$
declare recipient text; result jsonb;
begin
 select email_recipient into recipient from studio_private.admin_payment_alert_settings
 where id and email_enabled and email_recipient ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$';
 if recipient is null then return '[]'::jsonb; end if;
 with selected as (select order_id from studio_private.payment_alert_queue where status='pending'
 order by created_at limit 10 for update skip locked), claimed as (
 update studio_private.payment_alert_queue q set status='sending',attempted_at=now()
 from selected s where q.order_id=s.order_id returning q.order_id)
 select coalesce(jsonb_agg(jsonb_build_object('order_id',o.id,'recipient',recipient,
 'user_id',o.user_id,'plan',o.plan,'amount_paise',o.amount_paise,'payment_id',o.payment_id,
 'fulfilled_at',o.fulfilled_at)), '[]'::jsonb) into result
 from claimed c join studio_private.payment_orders o on o.id=c.order_id
 where o.environment='production' and o.status='paid';
 return result;
end $$;
create function public.studio_finish_payment_alert(order_uuid uuid,outcome text,message_id text,code text)
returns void language plpgsql security invoker set search_path='' as $$
begin
 if outcome not in('accepted','failed','uncertain') then raise exception 'Invalid alert outcome'; end if;
 update studio_private.payment_alert_queue set status=outcome,
 provider_message_id=left(message_id,300),result_code=left(code,100)
 where order_id=order_uuid and status='sending';
end $$;
revoke all on function public.studio_claim_payment_alerts(),public.studio_finish_payment_alert(uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.studio_claim_payment_alerts(),public.studio_finish_payment_alert(uuid,text,text,text) to service_role;
create function studio_private.invoke_payment_alert_sender() returns bigint
language plpgsql security definer set search_path='' as $$
declare secret text; result bigint;
begin
 if not exists(select 1 from studio_private.admin_payment_alert_settings where id and email_enabled)
 or not exists(select 1 from studio_private.payment_alert_queue where status='pending') then return 0; end if;
 select decrypted_secret into secret from vault.decrypted_secrets where name='studio_reminder_cron_secret' limit 1;
 if secret is null or length(secret)<32 then return 0; end if;
 select net.http_post(url:='https://jruxafztuvenabqlzefz.supabase.co/functions/v1/studio-payment-alerts',
 headers:=jsonb_build_object('Content-Type','application/json','x-studio-cron-secret',secret),
 body:='{}'::jsonb,timeout_milliseconds:=60000) into result;
 return result;
end $$;
revoke all on function studio_private.invoke_payment_alert_sender() from public,anon,authenticated;
select cron.schedule('studio-deliver-payment-alerts','* * * * *','select studio_private.invoke_payment_alert_sender();');
