begin;
-- Isolate the dry claim; no messages or network requests are made here.
update studio_private.reminder_queue set status='skipped' where status='pending';
delete from studio_private.reminder_day where day=current_date;
update public.studio_business_settings set email_enabled=true,daily_email_limit=1 where id;
do $$
declare member_id uuid:=gen_random_uuid(); other_id uuid:=gen_random_uuid(); rows jsonb; n integer;
begin
 insert into auth.users(id,email,email_confirmed_at,is_anonymous) values(member_id,member_id::text||'@example.invalid',now(),false),(other_id,other_id::text||'@example.invalid',now(),false);
 insert into public.studio_paid_memberships(user_id,environment,expires_at) values(member_id,'production',now()+interval '1 day'),(other_id,'production',now()+interval '1 day');
 insert into public.studio_notification_preferences(user_id,email_reminders) values(member_id,true),(other_id,false);
 perform studio_private.prepare_reminders(); perform studio_private.prepare_reminders();
 select count(*) into n from studio_private.reminder_queue where user_id=member_id;
 if n<>1 then raise exception 'Paid expiry queue deduplication failed'; end if;
 if exists(select 1 from studio_private.reminder_queue where user_id=other_id) then raise exception 'Consent missing'; end if;
 update public.studio_notification_preferences set email_reminders=false where user_id=member_id;
 perform studio_private.prepare_reminders();
 if exists(select 1 from studio_private.reminder_queue where user_id=member_id and status='pending') then raise exception 'Opt-out cancellation failed'; end if;
 update public.studio_notification_preferences set email_reminders=true where user_id=member_id;
 update public.studio_paid_memberships set expires_at=now()+interval '3 days' where user_id=member_id;
 perform studio_private.prepare_reminders();
 rows:=public.studio_claim_reminders();
 if jsonb_array_length(rows)<>1 then raise exception 'Dry claim failed'; end if;
 if rows->0->>'email'<>member_id::text||'@example.invalid' then raise exception 'Wrong recipient'; end if;
 if public.studio_claim_reminders()<>'[]'::jsonb then raise exception 'Daily cap or repeated claim failed'; end if;
 if has_function_privilege('authenticated','public.studio_claim_reminders()','EXECUTE') or has_function_privilege('anon','public.studio_payment_alert_authorized(text)','EXECUTE') then raise exception 'Server-only RPC exposed'; end if;
end $$;
select 'PASS paid expiry, consent, opt-out, renewal, deduplication, daily cap and server-only RPC' as result;
rollback;
