begin;
select set_config('request.jwt.claim.sub',(select user_id::text from public.studio_admins limit 1),true);
set local role authenticated;
do $$
declare overview jsonb; row jsonb; version_before bigint; original jsonb; old_time text; restored jsonb;
begin
 overview:=public.studio_admin_operations('overview');
 if jsonb_array_length(overview->'services')<>7 then raise exception 'Missing service records'; end if;
 row:=overview->'services'->0;old_time:=row->>'updated_at';
 perform public.studio_admin_operations('service_save',jsonb_build_object('service_id',row->>'service_id','renewal_on','2026-12-31','account_email','operations-test@example.invalid','state','attention','expected_updated_at',old_time));
 begin
  perform public.studio_admin_operations('service_save',jsonb_build_object('service_id',row->>'service_id','renewal_on','','account_email','','state','unknown','expected_updated_at',old_time));
  raise exception 'STALE WRITE ACCEPTED';
 exception when others then if sqlerrm='STALE WRITE ACCEPTED' then raise; end if; end;
 begin
  perform public.studio_admin_operations('service_save',jsonb_build_object('service_id',row->>'service_id','api_key','never-store-secrets'));
  raise exception 'SECRET FIELD ACCEPTED';
 exception when others then if sqlerrm='SECRET FIELD ACCEPTED' then raise; end if; end;
 select payload,version into original,version_before from public.studio_catalogs where id='draft';
 update public.studio_catalogs set payload=jsonb_set(payload,'{settings,announcement}','"transactional recovery test"'::jsonb),version=version+1 where id='draft';
 restored:=public.studio_admin_operations('recovery_get',jsonb_build_object('catalog_id','draft','version',version_before));
 if restored->'payload' is distinct from original then raise exception 'Recovery payload mismatch'; end if;
 for i in 1..6 loop update public.studio_catalogs set payload=jsonb_set(payload,'{settings,announcement}',to_jsonb('transactional recovery test '||i)),version=version+1 where id='draft'; end loop;
 overview:=public.studio_admin_operations('overview');
 if (select count(*) from jsonb_array_elements(overview->'recovery') r where r->>'catalog_id'='draft')<>5 then raise exception 'Retention failed'; end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 begin
  perform public.studio_admin_operations('overview');
  raise exception 'NON ADMIN ACCEPTED';
 exception when others then if sqlerrm='NON ADMIN ACCEPTED' then raise; end if; end;
end $$;
reset role;
select 'PASS: admin-only access, service save, stale-write block, secret-field block, exact recovery and five-version retention; all test mutations rolled back' as verification;
rollback;
