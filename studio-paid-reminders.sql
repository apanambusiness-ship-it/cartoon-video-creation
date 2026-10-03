-- Include only production entitlements in consenting expiry reminders.
create or replace function studio_private.prepare_reminders() returns integer language plpgsql security definer set search_path='' as $$
declare n integer;
begin
 with entitled as (select user_id,max(expires_at) expires_at from (select user_id,expires_at from public.studio_memberships where not revoked union all select user_id,expires_at from public.studio_trials union all select user_id,expires_at from public.studio_paid_memberships where environment='production')t group by user_id)
 insert into studio_private.reminder_queue(user_id,expires_at,days_left,channel)
 select m.user_id,m.expires_at,(m.expires_at at time zone 'Asia/Kolkata')::date-(now() at time zone 'Asia/Kolkata')::date,'email'
 from entitled m join public.studio_notification_preferences p using(user_id) join auth.users u on u.id=m.user_id
 where p.email_reminders and u.email_confirmed_at is not null and not coalesce(u.is_anonymous,false)
 and (m.expires_at at time zone 'Asia/Kolkata')::date-(now() at time zone 'Asia/Kolkata')::date in(7,3,1,0)
 and not exists(select 1 from studio_private.reminder_queue q where q.user_id=m.user_id and q.expires_at=m.expires_at and q.days_left=(m.expires_at at time zone 'Asia/Kolkata')::date-(now() at time zone 'Asia/Kolkata')::date and q.channel='email')
 order by m.expires_at limit 200 on conflict(user_id,expires_at,days_left,channel) do nothing;
 get diagnostics n=row_count;
 -- Expired pending notices are not sent late; renewed/revoked/opted-out rows are skipped.
 update studio_private.reminder_queue q set status='skipped',finished_at=now() where status='pending' and (created_at<now()-interval '2 days' or not exists(select 1 from public.studio_notification_preferences p where p.user_id=q.user_id and p.email_reminders and q.expires_at=(select max(expires_at) from (select expires_at from public.studio_memberships where user_id=q.user_id and not revoked union all select expires_at from public.studio_trials where user_id=q.user_id union all select expires_at from public.studio_paid_memberships where user_id=q.user_id and environment='production')t)));
 update studio_private.reminder_queue set status='uncertain',finished_at=now() where status='sending' and claimed_at<now()-interval '10 minutes';
 delete from studio_private.reminder_queue where status not in('pending','sending') and created_at<now()-interval '90 days';
 delete from studio_private.reminder_day where day<current_date-90;
 return n;
end $$;
revoke all on function studio_private.prepare_reminders() from public,anon,authenticated;

