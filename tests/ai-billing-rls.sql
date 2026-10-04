begin;
insert into auth.users(id,email,email_confirmed_at) values('9deec563-8b87-47d1-a11b-c94c1d4a5910','ai-billing-qa@example.invalid',now()),('9deec563-8b87-47d1-a11b-c94c1d4a5911','ai-billing-other@example.invalid',now());
update public.studio_ai_rates set provider_name='QA provider',provider_cost_paise=100,margin_percent=30 where kind='poster';
set local role service_role;
do $$
declare topup jsonb;job jsonb;j2 jsonb;before_balance bigint;
begin
 topup:=public.studio_ai_topup_reserve('9deec563-8b87-47d1-a11b-c94c1d4a5910','sandbox',5000);
 if topup->>'id' is distinct from public.studio_ai_topup_reserve('9deec563-8b87-47d1-a11b-c94c1d4a5910','sandbox',5000)->>'id' then raise exception 'Duplicate checkout';end if;
 begin perform public.studio_ai_topup_fulfill((topup->>'id')::uuid,'sandbox',10000,'INR','qa-pay');raise exception 'Mismatch accepted';exception when others then if sqlerrm='Mismatch accepted' then raise;end if;end;
 perform public.studio_ai_topup_fulfill((topup->>'id')::uuid,'sandbox',5000,'INR','qa-pay');
 perform public.studio_ai_topup_fulfill((topup->>'id')::uuid,'sandbox',5000,'INR','qa-pay');
 if (select available_paise from studio_private.ai_balances where user_id='9deec563-8b87-47d1-a11b-c94c1d4a5910' and environment='sandbox')<>5000 then raise exception 'Double credit';end if;
 job:=public.studio_ai_job_reserve('9deec563-8b87-47d1-a11b-c94c1d4a5910','sandbox','9deec563-8b87-47d1-a11b-c94c1d4a5920','poster',1,143);
 perform public.studio_ai_job_reserve('9deec563-8b87-47d1-a11b-c94c1d4a5910','sandbox','9deec563-8b87-47d1-a11b-c94c1d4a5920','poster',1,143);
 if (select held_paise from studio_private.ai_balances where user_id='9deec563-8b87-47d1-a11b-c94c1d4a5910')<>143 then raise exception 'Double reservation';end if;
 perform public.studio_ai_job_settle((job->>'id')::uuid,'uncertain');
 if (select held_paise from studio_private.ai_balances where user_id='9deec563-8b87-47d1-a11b-c94c1d4a5910')<>143 then raise exception 'Unknown outcome released';end if;
 perform public.studio_ai_job_settle((job->>'id')::uuid,'failed');perform public.studio_ai_job_settle((job->>'id')::uuid,'failed');
 if (select available_paise from studio_private.ai_balances where user_id='9deec563-8b87-47d1-a11b-c94c1d4a5910')<>5000 then raise exception 'Failure not restored';end if;
 j2:=public.studio_ai_job_reserve('9deec563-8b87-47d1-a11b-c94c1d4a5910','sandbox','9deec563-8b87-47d1-a11b-c94c1d4a5921','poster',1,143);
 perform public.studio_ai_job_settle((j2->>'id')::uuid,'ready',100,'9deec563-8b87-47d1-a11b-c94c1d4a5910/qa.png');
 perform public.studio_ai_job_settle((j2->>'id')::uuid,'ready',100,'9deec563-8b87-47d1-a11b-c94c1d4a5910/qa.png');
 if (select available_paise from studio_private.ai_balances where user_id='9deec563-8b87-47d1-a11b-c94c1d4a5910')<>4857 or (select margin_paise from studio_private.ai_jobs where id=(j2->>'id')::uuid)<>43 then raise exception 'Charge/margin incorrect';end if;
 begin perform public.studio_ai_job_reserve('9deec563-8b87-47d1-a11b-c94c1d4a5910','sandbox',gen_random_uuid(),'poster',60,999999);raise exception 'Overdraft accepted';exception when others then if sqlerrm='Overdraft accepted' then raise;end if;end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"9deec563-8b87-47d1-a11b-c94c1d4a5911","role":"authenticated"}',true);
do $$begin
 if jsonb_array_length(public.studio_ai_account()->'balances')<>0 then raise exception 'Cross-account balance leak';end if;
 begin perform public.studio_start_trial();raise exception 'Unpaid trial accepted';exception when others then if sqlerrm='Unpaid trial accepted' then raise;end if;end;
 if has_function_privilege('authenticated','public.studio_ai_job_settle(uuid,text,bigint,text)','EXECUTE') then raise exception 'Client can settle jobs';end if;
end $$;
reset role;
select 'PASS: idempotent topup/reserve/settle, failure release, uncertain hold, budget, account isolation and paid registration' as result;
rollback;
