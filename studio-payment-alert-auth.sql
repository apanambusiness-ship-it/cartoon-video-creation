-- Dedicated internal scheduler credential. Its value is never returned to clients.
do $$begin
 if not exists(select 1 from vault.secrets where name='studio_payment_alert_cron_secret') then
 perform vault.create_secret(replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-',''),'studio_payment_alert_cron_secret');
 end if;
end $$;
create function studio_private.payment_alert_authorized(supplied text) returns boolean
language sql security definer set search_path='' as $$
 select length(supplied)>=32 and exists(select 1 from vault.decrypted_secrets where name='studio_payment_alert_cron_secret' and decrypted_secret=supplied)
$$;
revoke all on function studio_private.payment_alert_authorized(text) from public,anon,authenticated;
grant execute on function studio_private.payment_alert_authorized(text) to service_role;
create function public.studio_payment_alert_authorized(supplied text) returns boolean
language sql security invoker set search_path='' as $$select studio_private.payment_alert_authorized(supplied)$$;
revoke all on function public.studio_payment_alert_authorized(text) from public,anon,authenticated;
grant execute on function public.studio_payment_alert_authorized(text) to service_role;
create or replace function studio_private.invoke_payment_alert_sender() returns bigint
language plpgsql security definer set search_path='' as $$
declare secret text; result bigint;
begin
 if not exists(select 1 from studio_private.admin_payment_alert_settings where id and email_enabled)
 or not exists(select 1 from studio_private.payment_alert_queue where status='pending') then return 0; end if;
 select decrypted_secret into secret from vault.decrypted_secrets where name='studio_payment_alert_cron_secret' limit 1;
 if secret is null or length(secret)<32 then return 0; end if;
 select net.http_post(url:='https://jruxafztuvenabqlzefz.supabase.co/functions/v1/studio-payment-alerts',
 headers:=jsonb_build_object('Content-Type','application/json','x-studio-cron-secret',secret),
 body:='{}'::jsonb,timeout_milliseconds:=60000) into result;
 return result;
end $$;
revoke all on function studio_private.invoke_payment_alert_sender() from public,anon,authenticated;
