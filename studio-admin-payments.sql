-- Narrow admin-only read API; payment credentials and checkout sessions stay private.
create or replace function studio_private.admin_payments(payment_environment text default 'production', payment_state text default 'all', page_offset integer default 0)
returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if not exists(select 1 from public.studio_admins where user_id=(select auth.uid())) then raise exception 'Admin access required' using errcode='42501'; end if;
 if payment_environment not in ('production','sandbox') or payment_state not in ('all','paid','pending') then raise exception 'Invalid payment filter'; end if;
 select jsonb_build_object('total',count(*),'paid_total_paise',coalesce(sum(amount_paise) filter(where status='paid'),0),'paid_count',count(*) filter(where status='paid')) into result from studio_private.payment_orders where environment=payment_environment and (payment_state='all' or status=payment_state);
 return result||jsonb_build_object('rows',coalesce((select jsonb_agg(to_jsonb(r)) from (
 select o.id,o.user_id,p.full_name,o.environment,o.plan,o.amount_paise,o.status,o.payment_id,o.created_at,o.fulfilled_at,m.expires_at
 from studio_private.payment_orders o left join public.studio_profiles p on p.user_id=o.user_id left join public.studio_paid_memberships m on m.user_id=o.user_id and m.environment=o.environment
 where o.environment=payment_environment and (payment_state='all' or o.status=payment_state)
 order by o.created_at desc,o.id desc limit 25 offset greatest(0,least(coalesce(page_offset,0),1000000))) r),'[]'::jsonb));
end $$;
revoke all on function studio_private.admin_payments(text,text,integer) from public,anon;
grant execute on function studio_private.admin_payments(text,text,integer) to authenticated;
grant usage on schema studio_private to authenticated;
create or replace function public.studio_admin_payments(payment_environment text default 'production',payment_state text default 'all',page_offset integer default 0) returns jsonb language sql security invoker set search_path='' as $$ select studio_private.admin_payments(payment_environment,payment_state,page_offset); $$;
revoke all on function public.studio_admin_payments(text,text,integer) from public,anon;
grant execute on function public.studio_admin_payments(text,text,integer) to authenticated;
