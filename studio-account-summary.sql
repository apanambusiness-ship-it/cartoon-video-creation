-- Own effective access, with sandbox excluded from real validity.
create function public.studio_member_access() returns jsonb language sql security invoker set search_path='' as $$
select coalesce((select jsonb_build_object('kind',kind,'expires_at',expires_at,'started_at',started_at,'active',expires_at>now()) from (
select 'paid'::text kind,expires_at,updated_at started_at,1 priority from public.studio_paid_memberships where user_id=(select auth.uid()) and environment='production'
union all select 'business',expires_at,granted_at,2 from public.studio_memberships where user_id=(select auth.uid()) and not revoked
union all select 'trial',expires_at,started_at,3 from public.studio_trials where user_id=(select auth.uid())
) s order by expires_at desc,priority limit 1),'{}'::jsonb)
$$;
revoke all on function public.studio_member_access() from public,anon;
grant execute on function public.studio_member_access() to authenticated;
create function studio_private.own_payments(page_offset integer default 0) returns jsonb language plpgsql security definer set search_path='' as $$
declare owner uuid:=auth.uid(); result jsonb;
begin
 if owner is null then raise exception 'Login required'; end if;
 select jsonb_build_object('total',count(*)) into result from studio_private.payment_orders where user_id=owner;
 return result||jsonb_build_object('rows',coalesce((select jsonb_agg(to_jsonb(r)) from (
 select id,environment,plan,amount_paise,status,payment_id,created_at,fulfilled_at from studio_private.payment_orders
 where user_id=owner order by created_at desc,id desc limit 25 offset greatest(0,least(coalesce(page_offset,0),1000000))) r),'[]'::jsonb));
end $$;
revoke all on function studio_private.own_payments(integer) from public,anon;
grant execute on function studio_private.own_payments(integer) to authenticated;
create function public.studio_own_payments(page_offset integer default 0) returns jsonb language sql security invoker set search_path='' as $$select studio_private.own_payments(page_offset)$$;
revoke all on function public.studio_own_payments(integer) from public,anon;
grant execute on function public.studio_own_payments(integer) to authenticated;
create function studio_private.alert_health() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.studio_admins where user_id=auth.uid()) then raise exception 'Admin access required'; end if;
 return jsonb_build_object('payment_alerts',coalesce((select jsonb_agg(to_jsonb(r)) from (
 select 'apn_'||order_id::text as reference,case when status='sending' and attempted_at<now()-interval '10 minutes' then 'uncertain' else status end status,result_code,created_at,attempted_at from studio_private.payment_alert_queue order by created_at desc limit 100)r),'[]'::jsonb),
 'expiry_alerts',coalesce((select jsonb_agg(to_jsonb(r)) from (
 select user_id,expires_at,status,provider_id as result_code,created_at from studio_private.reminder_queue where status in('failed','uncertain','sending') order by created_at desc limit 100)r),'[]'::jsonb));
end $$;
revoke all on function studio_private.alert_health() from public,anon;
grant execute on function studio_private.alert_health() to authenticated;
create function public.studio_alert_health() returns jsonb language sql security invoker set search_path='' as $$select studio_private.alert_health()$$;
revoke all on function public.studio_alert_health() from public,anon;
grant execute on function public.studio_alert_health() to authenticated;
