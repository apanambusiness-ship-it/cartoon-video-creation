-- Apply once after studio-registration-autopay.sql.
-- Registration is a one-time ₹10 payment. Existing mandates remain visible for cancellation.
begin;
create or replace function public.studio_registration_status(owner_id uuid,env text) returns jsonb
language sql security invoker set search_path='' as $$
 select jsonb_build_object(
  'order_id','apn_'||o.id,
  'paid',o.status='paid',
  'consent_version',o.autopay_consent_version,
  'trial_ends_at',case when o.status='paid' then o.fulfilled_at+interval '15 days' end,
  'autopay_status',(select s.status from studio_private.subscriptions s
    where s.user_id=owner_id and s.environment=env order by s.created_at desc limit 1)
 )
 from studio_private.payment_orders o
 where o.user_id=owner_id and o.environment=env and o.plan='registration'
 order by (o.status='paid') desc,o.created_at desc limit 1
$$;
revoke all on function public.studio_registration_status(uuid,text) from public,anon,authenticated;
grant execute on function public.studio_registration_status(uuid,text) to service_role;
notify pgrst,'reload schema';
commit;
