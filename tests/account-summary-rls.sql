begin;
do $$declare owner uuid:=gen_random_uuid(); outsider uuid:=gen_random_uuid(); result jsonb; failed boolean:=false;
begin
 insert into auth.users(id,email,email_confirmed_at) values(owner,owner::text||'@example.invalid',now()),(outsider,outsider::text||'@example.invalid',now());
 insert into public.studio_paid_memberships(user_id,environment,expires_at) values(owner,'production',now()+interval '30 days'),(owner,'sandbox',now()+interval '999 days');
 insert into public.studio_trials(user_id) values(owner);
 insert into studio_private.payment_orders(user_id,environment,plan,amount_paise,status,payment_id,fulfilled_at) values(owner,'production','manual',10000,'paid','test-receipt-'||owner,now());
 perform set_config('request.jwt.claims',jsonb_build_object('sub',owner,'role','authenticated')::text,true);
 result:=public.studio_member_access();if result->>'kind'<>'paid' or (result->>'expires_at')::timestamptz>now()+interval '31 days' then raise exception 'Sandbox contaminated real validity';end if;
 result:=public.studio_own_payments();if jsonb_array_length(result->'rows')<>1 or (result->'rows'->0) ? 'session_id' or (result->'rows'->0) ? 'user_id' then raise exception 'Receipt data invalid';end if;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',outsider,'role','authenticated')::text,true);
 if public.studio_own_payments()->>'total'<>'0' then raise exception 'Other user sees payment';end if;
 begin perform public.studio_alert_health();exception when others then if sqlerrm='Admin access required' then failed:=true;else raise;end if;end;
 if not failed then raise exception 'Non-admin sees alerts';end if;
 if has_function_privilege('anon','public.studio_own_payments(integer)','EXECUTE') then raise exception 'Anonymous payment API';end if;
end $$;
select 'PASS own receipt isolation, no checkout session, real validity excludes sandbox, alert admin guard' as result;
rollback;
