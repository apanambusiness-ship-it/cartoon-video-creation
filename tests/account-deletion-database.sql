begin;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
set local role authenticated;
do $$ declare a jsonb;b jsonb; begin
 begin perform public.studio_account_deletion('request','{}'); raise exception 'BAD_CONFIRM'; exception when others then if sqlerrm='BAD_CONFIRM' then raise;end if;end;
 a:=public.studio_account_deletion('request','{"confirmation":"DELETE"}');b:=public.studio_account_deletion('request','{"confirmation":"DELETE"}');
 if a<>b or a->>'status'<>'requested' then raise exception 'Duplicate or missing request';end if;
 begin perform public.studio_account_deletion('admin_list');raise exception 'ADMIN_LEAK';exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true);
 if public.studio_account_deletion('status')<>'null'::jsonb then raise exception 'Cross account leak';end if;
 perform set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
 if public.studio_account_deletion('cancel')->>'status'<>'cancelled' then raise exception 'Cancel failed';end if;
 perform public.studio_account_deletion('request','{"confirmation":"DELETE"}');
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select user_id::text from public.studio_admins limit 1),true);
set local role authenticated;
do $$ declare rows jsonb;r jsonb;begin
 rows:=public.studio_account_deletion('admin_list');select v into r from jsonb_array_elements(rows) v where v->>'user_id'='11111111-1111-4111-8111-111111111111';
 if r is null then raise exception 'Missing admin queue';end if;
 begin perform public.studio_account_deletion('admin_update',jsonb_build_object('user_id',r->>'user_id','status','completed','admin_note','Test','expected_updated_at',r->>'updated_at'));raise exception 'UNVERIFIED_COMPLETE';exception when others then if sqlerrm='UNVERIFIED_COMPLETE' then raise;end if;end;
 r:=public.studio_account_deletion('admin_update',jsonb_build_object('user_id',r->>'user_id','status','reviewing','admin_note','Review started','expected_updated_at',r->>'updated_at'));
 if r->>'status'<>'reviewing' then raise exception 'Review failed';end if;
end $$;
rollback;
