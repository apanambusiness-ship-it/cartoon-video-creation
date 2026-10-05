-- Additive paid Shubh integration; activation is OFF until merchant/provider tests pass.
begin;
create table if not exists studio_private.paid_voice_config (
 id boolean primary key default true check(id), enabled boolean not null default false,
 unit_characters integer not null default 100 check(unit_characters=100),
 unit_ceiling_paise integer not null default 70 check(unit_ceiling_paise=70),
 margin_percent integer not null default 30 check(margin_percent=30)
);
insert into studio_private.paid_voice_config(id) values(true) on conflict do nothing;
create table if not exists studio_private.paid_voice_inputs (
 job_id uuid primary key references studio_private.ai_jobs(id) on delete cascade,
 input_digest text not null check(input_digest ~ '^[0-9a-f]{64}$'),
 characters integer not null check(characters between 1 and 220), language_code text not null,
 provider text not null default 'sarvam/bulbul:v3/shubh',
 tariff_estimate_paise bigint not null,
 cost_basis text not null default 'published_tariff_not_invoice' check(cost_basis='published_tariff_not_invoice')
);
alter table studio_private.paid_voice_config enable row level security;
alter table studio_private.paid_voice_inputs enable row level security;
revoke all on studio_private.paid_voice_config,studio_private.paid_voice_inputs from public,anon,authenticated;
grant select,insert,update on studio_private.paid_voice_config,studio_private.paid_voice_inputs to service_role;
create or replace function public.studio_paid_voice_quote(character_count integer) returns jsonb language plpgsql security invoker set search_path='' as $$
declare c studio_private.paid_voice_config; units integer;
begin
 if character_count is null or character_count not between 1 and 220 then raise exception 'Scene text 1–220 characters'; end if;
 select * into strict c from studio_private.paid_voice_config where id;
 units:=ceil(character_count::numeric/c.unit_characters);
 return jsonb_build_object('characters',character_count,'units',units,'charge_paise',ceil(units*c.unit_ceiling_paise::numeric*100/(100-c.margin_percent)),'enabled',c.enabled,'pricing_version','shubh-100-v1');
end $$;
create or replace function public.studio_paid_voice_claim(owner_id uuid,env text,request_id uuid,digest text,character_count integer,language text,maximum_paise bigint) returns jsonb language plpgsql security invoker set search_path='' as $$
declare j studio_private.ai_jobs; i studio_private.paid_voice_inputs; q jsonb; units integer; price bigint;
begin
 if owner_id is null or request_id is null or env is null or env not in('production','sandbox') or digest is null or digest !~ '^[0-9a-f]{64}$' or language is null or language not in('hi-IN','bn-IN','gu-IN','kn-IN','ml-IN','mr-IN','od-IN','pa-IN','ta-IN','te-IN','en-IN') then raise exception 'Invalid voice request'; end if;
 q:=public.studio_paid_voice_quote(character_count); units:=(q->>'units')::integer;price:=(q->>'charge_paise')::bigint;
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text||env,917));
 select * into j from studio_private.ai_jobs where user_id=owner_id and environment=env and request_key=request_id;
 if found then
  select * into i from studio_private.paid_voice_inputs where job_id=j.id;
  if not found or i.input_digest is distinct from digest or i.characters is distinct from character_count or i.language_code is distinct from language then raise exception 'Request key reused for different input';end if;
  return to_jsonb(j)||jsonb_build_object('claimed',false);
 end if;
 if env='sandbox' then
  if not exists(select 1 from public.studio_admins where user_id=owner_id) then raise exception 'Admin-only sandbox';end if;
 else
  if not (q->>'enabled')::boolean or not exists(select 1 from public.studio_business_settings where id and ai_enabled) then raise exception 'Paid voice not active';end if;
  if not exists(select 1 from public.studio_paid_memberships where user_id=owner_id and environment='production' and expires_at>now() union all select 1 from public.studio_memberships where user_id=owner_id and not revoked and expires_at>now() union all select 1 from public.studio_trials where user_id=owner_id and expires_at>now()) then raise exception 'Active membership required';end if;
 end if;
 if maximum_paise is null or price>maximum_paise then raise exception 'Price exceeds approved budget';end if;
 if (select count(*) from studio_private.paid_voice_inputs v join studio_private.ai_jobs a on a.id=v.job_id where a.user_id=owner_id and a.created_at>now()-interval '1 day')>=20 then raise exception 'Daily voice limit';end if;
 update studio_private.ai_balances set available_paise=available_paise-price,held_paise=held_paise+price where user_id=owner_id and environment=env and available_paise>=price;
 if not found then raise exception 'Insufficient AI balance';end if;
 insert into studio_private.ai_jobs(user_id,environment,request_key,kind,units,charge_paise,provider_estimate_paise,state) values(owner_id,env,request_id,'audio',units,price,units*70,'processing') returning * into j;
 insert into studio_private.paid_voice_inputs(job_id,input_digest,characters,language_code,tariff_estimate_paise) values(j.id,digest,character_count,language,ceil(character_count::numeric*3000/10000));
 insert into studio_private.ai_ledger(user_id,environment,event,reference,amount_paise) values(owner_id,env,'reserve',j.id,price);
 return to_jsonb(j)||jsonb_build_object('claimed',true);
end $$;
create or replace function public.studio_paid_voice_finish(job_id uuid,outcome text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare j studio_private.ai_jobs; result jsonb;
begin
 select * into j from studio_private.ai_jobs where id=job_id;
 if not exists(select 1 from studio_private.paid_voice_inputs where paid_voice_inputs.job_id=studio_paid_voice_finish.job_id) then raise exception 'Not a voice job';end if;
 result:=public.studio_ai_job_settle(job_id,outcome,case when outcome='ready' then 0 else null end,case when outcome='ready' then j.user_id::text||'/'||j.id::text||'.wav' end);
 -- Provider invoices have not been reconciled: do not report tariff estimates as actual cost/profit.
 if outcome='ready' then update studio_private.ai_jobs set provider_cost_paise=null,margin_paise=null where id=job_id;end if;
 return result-'provider_cost_paise'-'margin_paise';
end $$;
revoke all on function public.studio_paid_voice_quote(integer),public.studio_paid_voice_claim(uuid,text,uuid,text,integer,text,bigint),public.studio_paid_voice_finish(uuid,text) from public,anon,authenticated;
grant execute on function public.studio_paid_voice_quote(integer),public.studio_paid_voice_claim(uuid,text,uuid,text,integer,text,bigint),public.studio_paid_voice_finish(uuid,text) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('studio-paid-voices','studio-paid-voices',false,2000000,array['audio/wav']) on conflict(id) do nothing;
create or replace function public.studio_paid_voice_existing(owner_id uuid,env text,request_id uuid,digest text) returns jsonb language plpgsql security invoker set search_path='' as $$
declare j studio_private.ai_jobs;
begin
 select a.* into j from studio_private.ai_jobs a join studio_private.paid_voice_inputs v on v.job_id=a.id where a.user_id=owner_id and a.environment=env and a.request_key=request_id and v.input_digest=digest;
 return case when found then to_jsonb(j) else null end;
end $$;
revoke all on function public.studio_paid_voice_existing(uuid,text,uuid,text) from public,anon,authenticated;
grant execute on function public.studio_paid_voice_existing(uuid,text,uuid,text) to service_role;
create or replace function studio_private.ai_business_summary() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not exists(select 1 from public.studio_admins where user_id=auth.uid()) then raise exception 'Admin required';end if;
 return jsonb_build_object('summary',coalesce((select jsonb_agg(s) from (select environment,count(*) filter(where state='ready') completed,count(*) filter(where state='ready' and provider_cost_paise is null) unreconciled_completed,count(*) filter(where state in('reserved','processing','uncertain')) pending,coalesce(sum(charge_paise) filter(where state='ready'),0) revenue_paise,coalesce(sum(provider_cost_paise) filter(where state='ready'),0) provider_cost_paise,coalesce(sum(margin_paise) filter(where state='ready'),0) gross_margin_paise from studio_private.ai_jobs group by environment)s),'[]'::jsonb),'balances',coalesce((select jsonb_agg(b) from (select environment,sum(available_paise) available_paise,sum(held_paise) held_paise from studio_private.ai_balances group by environment)b),'[]'::jsonb));
end $$;
drop policy if exists "No direct client access" on studio_private.paid_voice_config;
create policy "No direct client access" on studio_private.paid_voice_config for all to authenticated using(false) with check(false);
drop policy if exists "No direct client access" on studio_private.paid_voice_inputs;
create policy "No direct client access" on studio_private.paid_voice_inputs for all to authenticated using(false) with check(false);
update public.studio_ai_rates set provider_name='Sarvam bulbul:v3 shubh (budget ceiling)',provider_cost_paise=70,margin_percent=30 where kind='audio';
notify pgrst,'reload schema';
commit;
