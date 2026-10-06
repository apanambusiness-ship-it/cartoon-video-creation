begin;
insert into auth.users(id,email,email_confirmed_at) values('f623a490-664c-44c0-9900-000000000001','registration-qa@example.invalid',now()),('f623a490-664c-44c0-9900-000000000002','registration-other@example.invalid',now());
set local role service_role;
do $$
declare u uuid:='f623a490-664c-44c0-9900-000000000001';o jsonb;s jsonb;again jsonb;expiry timestamptz;
begin
 begin perform public.studio_registration_reserve(u,'sandbox','bad');raise exception 'Consent bypass';exception when others then if sqlerrm='Consent bypass' then raise;end if;end;
 o:=public.studio_registration_reserve(u,'sandbox','registration-10-trial15-autopay100-30-v1');
 again:=public.studio_registration_reserve(u,'sandbox','registration-10-trial15-autopay100-30-v1');if o->>'id'<>again->>'id' then raise exception 'Duplicate registration';end if;
 begin perform public.studio_registration_subscription(u,'sandbox',(o->>'id')::uuid);raise exception 'Unpaid accepted';exception when others then if sqlerrm='Unpaid accepted' then raise;end if;end;
 perform public.studio_payment_fulfill((o->>'id')::uuid,'sandbox',1000,'INR','registration-test-payment');
 expiry:=(public.studio_registration_status(u,'sandbox')->>'trial_ends_at')::timestamptz;
 if expiry is null or expiry<now()+interval '15 days'-interval '1 second' then raise exception 'Trial date wrong';end if;
 if public.studio_registration_status('f623a490-664c-44c0-9900-000000000002','sandbox') is not null then raise exception 'Owner leak';end if;
 begin perform public.studio_registration_subscription('f623a490-664c-44c0-9900-000000000002','sandbox',(o->>'id')::uuid);raise exception 'Other account accepted';exception when others then if sqlerrm='Other account accepted' then raise;end if;end;
 s:=public.studio_registration_subscription(u,'sandbox',(o->>'id')::uuid);
 if abs(extract(epoch from (s->>'first_charge_at')::timestamptz-expiry))>1 then raise exception 'First debit not trial end';end if;
 again:=public.studio_registration_subscription(u,'sandbox',(o->>'id')::uuid);if s->>'id'<>again->>'id' then raise exception 'Duplicate mandate';end if;
 begin perform public.studio_registration_reserve(u,'sandbox','registration-10-trial15-autopay100-30-v1');raise exception 'Paid registration resold';exception when others then if sqlerrm='Paid registration resold' then raise;end if;end;
 if exists(select 1 from public.studio_trials where user_id=u) or exists(select 1 from public.studio_paid_memberships where user_id=u and environment='production') then raise exception 'Sandbox grants live access';end if;
 if has_function_privilege('authenticated','public.studio_registration_reserve(uuid,text,text)','EXECUTE') or has_function_privilege('authenticated','public.studio_registration_status(uuid,text)','EXECUTE') or has_function_privilege('authenticated','public.studio_registration_subscription(uuid,text,uuid)','EXECUTE') then raise exception 'Client RPC exposed';end if;
end $$;
reset role;
select 'PASS registration consent, idempotency, unpaid/other account rejection, exact 15-day date, no second fee, private RPC, sandbox isolation' as result;
rollback;
