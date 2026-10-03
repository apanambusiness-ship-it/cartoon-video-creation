-- Reuse the already generated private scheduler credential, never expose it.
create or replace function studio_private.invoke_reminder_sender() returns bigint
language plpgsql security definer set search_path='' as $$
declare secret text; result bigint;
begin
 if not exists(select 1 from public.studio_business_settings where id and email_enabled) then return 0; end if;
 select decrypted_secret into secret from vault.decrypted_secrets where name='studio_payment_alert_cron_secret' limit 1;
 if secret is null or length(secret)<32 then return 0; end if;
 select net.http_post(url:='https://jruxafztuvenabqlzefz.supabase.co/functions/v1/studio-business?action=send-reminders',
 headers:=jsonb_build_object('Content-Type','application/json','x-studio-cron-secret',secret),
 body:='{}'::jsonb,timeout_milliseconds:=60000) into result;
 return result;
end $$;
revoke all on function studio_private.invoke_reminder_sender() from public,anon,authenticated;
